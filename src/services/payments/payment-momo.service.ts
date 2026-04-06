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
  createPayment: async (userId: string, amount: number, type: ETransactionType, method: EPaymentMethod ): Promise<CreatePaymentResponse> => {
    // Validate amount
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!amount || amount < 50000) {
      throw new Error("Amount must be at least 50,000 VND");
    }

    if (!Number.isInteger(amount)) {
      throw new Error("Amount must be an integer");
    }

    const wallet = await walletService.getOrCreateWallet(userId)

    const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const requestId = uuidv4();
    const orderInfo = `Payment for transaction ${orderId}`;
    const extraData = "";
    const requestType = "captureWallet";

    // Step 1: Save transaction as PENDING
    const transaction = new WalletTransaction({
        wallet_id: wallet._id,
        amount: amount,
        type: type,
        method_payment: method,
        status: ETransactionStatus.PENDING,
        user_id: userId,
        description: `Payment for transaction from MoMo: type_transaction [${type}] with amount [${amount}] VND`,
        payment_order_id: orderId,
        payment_request_id: requestId,
        payment_order_info: orderInfo
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
          timeout: 30000,
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
          { payment_order_id: orderId },
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
          { payment_order_id: orderId },
          { status: ETransactionStatus.FAILED }
        );
        throw new Error(`MoMo API request failed: ${error.message}`);
      }
      throw error;
    }
  },

  /**
   * Handle MoMo callback (IPN).
   *
   * 1. Rebuild raw signature from callback body
   * 2. Verify signature → reject if invalid
   * 3. Find transaction by payment_order_id
   * 4. Create session transaction
   * 5. Check if transaction is valid: Update status to PAID or FAILED
   * 6. Update balance of wallet depend on wallet_id from transaction
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
      logger.error("SECURITY: Invalid callback signature detected!", {
        orderId: body.orderId,
        receivedSignature: body.signature,
      });
      throw new Error("Invalid signature — possible fraud attempt");
    }

    logger.info("Callback signature verified successfully", { orderId: body.orderId });

    // Step 3: Find transaction
    const transaction = await WalletTransaction.findOne({ payment_order_id: body.orderId });

    if (!transaction) {
      logger.error("Transaction not found for callback", { orderId: body.orderId });
      throw new Error(`Transaction not found: ${body.orderId}`);
    }

    // Step 4: Prevent duplicate payment
    if (transaction.status === ETransactionStatus.COMPLETED) {
      logger.warn("Duplicate callback — Transaction already PAID", { orderId: body.orderId });
      return; // Silently ignore, don't error
    }

    // Step 5: Validate amount consistency
    if (transaction.amount !== body.amount) {
      logger.error("SECURITY: Amount mismatch detected!", {
        orderId: body.orderId,
        expectedAmount: transaction.amount,
        receivedAmount: body.amount,
      });
      throw new Error("Amount mismatch — possible fraud attempt");
    }

    // Step 6: Update transaction
    if (body.resultCode === 0) {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // 1. update transaction
            transaction.status = ETransactionStatus.COMPLETED
            await transaction.save({ session })

            // 2. update wallet
            await Wallet.findByIdAndUpdate(
              transaction.wallet_id,
              { $inc: { balance: transaction.amount } },
              { session }
            )

            await session.commitTransaction()
        } catch (err) {
            await session.abortTransaction()
            throw err
        } finally {
            session.endSession()
        }
    } else {
      transaction.status = ETransactionStatus.FAILED;
      await transaction.save();
      logger.info("Transaction payment failed", {
        orderId: body.orderId,
        resultCode: body.resultCode,
        message: body.message,
      });
    }
  },

  /**
   * Get order status by orderId.
   */
  getOrderStatus : async (orderId: string): Promise<ITransactionStatusResponse> => {
    const order = await WalletTransaction.findOne({ payment_order_id: orderId });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    return {
      payment_order_id: order.payment_order_id as string,
      amount: order.amount,
      status: order.status as ETransactionStatus,
      payment_request_id: order.payment_request_id as string,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }
}
