import mongoose from "mongoose";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import config from "@/config/payment-momo.config";
import {
  CreatePaymentResponse,
  MoMoCallbackBody,
  MoMoCreatePaymentRequest,
  MoMoCreatePaymentResponse
} from "@/constants/payment-momo.constants";

import {
  buildCallbackRawSignature,
  buildCreatePaymentRawSignature,
  createSignature,
  verifyCallbackSignature,
} from "@/utils/payment-momo.signature";

import logger from "@/utils/logger";
import { walletService } from "../wallet/wallet.service";
import { EPaymentMethod, ETransactionStatus, ETransactionType } from "@/constants/wallet.constants";
import { ITransactionStatusResponse } from "@/constants/payment-momo.constants";
import { WalletTransaction } from "@/models/wallet_transaction.model";
import { Wallet } from "@/models/wallet.model";

/**
 * Payment Service — handles all business logic for MoMo payments.
 */
export const paymentService = {
  /**
   * Create a new MoMo QR payment.
   *
   * 1. Generate orderId & requestId following format: momo
   * 2. Save transaction as PENDING in MongoDB
   * 3. Build raw signature & sign with HMAC SHA256
   * 4. POST to MoMo endpoint
   * 5. Return qrCodeUrl, payUrl, orderId
   */
  createPayment: async (userId: string, amount: number, type: ETransactionType, method: EPaymentMethod, description: string ): Promise<CreatePaymentResponse> => {
    // Validate amount
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!amount || amount < 100000) {
      throw new Error("Số tiền tối thiểu là 100.000 VNĐ");
    }

    if (!Number.isInteger(amount)) {
      throw new Error("Số tiền phải là số nguyên");
    }

    const wallet = await walletService.getOrCreateWallet(userId)

    const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const requestId = uuidv4();
    const orderInfo = `Payment for transaction ${orderId}`;
    const extraData = "";
    const requestType = "captureWallet";

    // Step 1: Save transaction as PENDING
    const transaction = new WalletTransaction({
        walletId: wallet._id,
        amount: amount,
        type: type,
        methodPayment: method,
        status: ETransactionStatus.PENDING,
        userId: userId,
        description: description || `transaction from MoMo with amount [${amount}] VND`,
        paymentOrderId: orderId,
        paymentRequestId: requestId,
        paymentOrderInfo: orderInfo
    })
    await transaction.save()

    logger.info("Transaction created", { orderId, amount, status: ETransactionStatus.PENDING });

    // Step 2: Build signature
    const rawSignature = buildCreatePaymentRawSignature({
      accessKey: config.momo.accessKey,
      amount,
      extraData,
      ipnUrl: config.momo.notifyUrl,
      orderId,
      orderInfo,
      partnerCode: config.momo.partnerCode,
      redirectUrl: config.momo.returnUrl,
      requestId,
      requestType,
    });

    const signature = createSignature(rawSignature, config.momo.secretKey);
    logger.debug("Signature created", { rawSignature, signature });

    // Step 3: Build MoMo request body
    const requestBody: MoMoCreatePaymentRequest = {
      partnerCode: config.momo.partnerCode,
      partnerName: "MoMo Payment",
      storeId: config.momo.partnerCode,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: config.momo.returnUrl,
      ipnUrl: config.momo.notifyUrl,
      lang: "vi",
      requestType,
      autoCapture: true,
      extraData,
      signature,
    };

    // Step 4: Call MoMo API
    try {
      const response = await axios.post<MoMoCreatePaymentResponse>(
        config.momo.endpoint,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      const momoResponse = response.data;
      logger.info("MoMo API response", {
        resultCode: momoResponse.resultCode,
        message: momoResponse.message,
        orderId: momoResponse.orderId,
      });

      if (momoResponse.resultCode !== 0) {
        // Update order to FAILED
        await WalletTransaction.findOneAndUpdate(
          { paymentOrderId: orderId },
          { status: ETransactionStatus.FAILED }
        );
        throw new Error(`MoMo API error: ${momoResponse.message} (code: ${momoResponse.resultCode})`);
      }

      return {
        orderId: momoResponse.orderId,
        qrCodeUrl: momoResponse.qrCodeUrl,
        payUrl: momoResponse.payUrl,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error("MoMo API request failed", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        // Update order to FAILED
        await WalletTransaction.findOneAndUpdate(
          { paymentOrderId: orderId },
          { status: ETransactionStatus.FAILED }
        );
        throw new Error(`MoMo API request failed: ${error.message}`);
      }
      throw error;
    }
  },

  /**
   * Handle MoMo callback (IPN).
   */
  handleCallback: async (body: MoMoCallbackBody): Promise<void> => {
    logger.info("MoMo callback received", {
      orderId: body.orderId,
      resultCode: body.resultCode,
      amount: body.amount,
      transId: body.transId,
    });

    // Step 1: Rebuild raw signature
    const rawSignature = buildCallbackRawSignature({
      accessKey: config.momo.accessKey,
      amount: body.amount,
      extraData: body.extraData,
      message: body.message,
      orderId: body.orderId,
      orderInfo: body.orderInfo,
      orderType: body.orderType,
      partnerCode: body.partnerCode,
      payType: body.payType,
      requestId: body.requestId,
      responseTime: body.responseTime,
      resultCode: body.resultCode,
      transId: body.transId,
    });

    // Step 2: Verify signature
    const isValid = verifyCallbackSignature(
      body.signature,
      rawSignature,
      config.momo.secretKey
    );

    if (!isValid) {
      throw new Error("Invalid signature — possible fraud attempt");
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Tìm transaction và LOCK bản ghi này trong session
        const transaction = await WalletTransaction.findOne(
          { paymentOrderId: body.orderId },
          null,
          { session }
        );

        if (!transaction) {
          // Log lỗi nhưng không cần throw nếu bạn muốn trả về 204 cho MoMo luôn
          throw new Error("Transaction not found");
        }

        // Kiểm tra trạng thái (Idempotency)
        if (transaction.status === ETransactionStatus.COMPLETED) {
          return; // Thoát êm đẹp
        }

        // Kiểm tra số tiền
        if (Number(transaction.amount) !== Number(body.amount)) {
          throw new Error("Amount mismatch");
        }

        if (body.resultCode === 0) {
          transaction.status = ETransactionStatus.COMPLETED;
          await transaction.save({ session });

          // Cộng tiền ví
          await Wallet.findByIdAndUpdate(
            transaction.walletId,
            { $inc: { balance: transaction.amount } },
            { session, new: true }
          );
        } else {
          transaction.status = ETransactionStatus.FAILED;
          await transaction.save({ session });
        }
      });
    } catch (error) {
      logger.error("MoMo Callback Transaction Error:", error);
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Get order status by orderId.
   */
  getOrderStatus : async (orderId: string): Promise<ITransactionStatusResponse> => {
    const order = await WalletTransaction.findOne({ paymentOrderId: orderId }).populate("userId", "fullName email");

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    return {
      paymentOrderId: order.paymentOrderId as string,
      amount: order.amount,
      fullName: (order.userId as any).fullName || '',
      email: (order.userId as any).email || '',
      status: order.status as ETransactionStatus,
      paymentRequestId: order.paymentRequestId as string,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }
}
