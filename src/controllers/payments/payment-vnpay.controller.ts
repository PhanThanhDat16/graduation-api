// src/controllers/vnpay.controller.ts
import { Request, Response } from 'express';

import {
  createPaymentUrl,
  verifyReturnHash,
  getResponseMessage,
  formatDate,
  verifySecureHash,
} from '@/utils/payment-vnpay.untils';
import { v4 as uuidv4 } from "uuid";
import vnpayConfig from '@/config/payment-vnpay.config';
import crypto from 'crypto';
import { sortObject } from '@/utils/payment-vnpay.untils';
import dotenv from 'dotenv';
import { RequestWithUser } from '@/middlewares/auth.middlewares';
import { EPaymentMethod, ETransactionStatus, ETransactionType } from '@/constants/wallet.constants';
import { HttpStatus } from '@/constants/http.constants';
import { WalletTransaction } from '@/models/wallet_transaction.model';
import { walletService } from '@/services/wallet/wallet.service';
import mongoose from 'mongoose';
import { Wallet } from '@/models/wallet.model';
import expressAsyncHandler from "express-async-handler";
import logger from '@/utils/logger';

dotenv
export const vnpayController = {
  /**
   * Tạo payment URL và redirect đến VNPay
   */
  createPayment: expressAsyncHandler(async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const { amount, type, method } = req.body;
        const userId = req.user?._id
    
        // Validate input
        if(!userId){
            res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }
    
        if (!amount || typeof amount !== "number") {
            res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Invalid request: 'amount' is required and must be a number",
            });
            return;
        }
    
        if(!type || type !== ETransactionType.DEPOSIT){
            res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Invalid request: 'type' is required",
            });
            return;
        }
        
        if(!method || method !== EPaymentMethod.VNPAY){
            res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Invalid request: 'method' is required",
            });
            return;
        }
    
        if (amount < 50000) {
            res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: "Amount must be at least 50,000 VND",
            });
            return;
        }

        const wallet = await walletService.getOrCreateWallet(userId)
        
        const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`;
        const requestId = uuidv4();
        const orderInfo = `Payment for transaction ${orderId}`;
    
        // Step 1: Save transaction as PENDING
        const transaction = new WalletTransaction({
            wallet_id: wallet._id,
            amount: amount,
            type: type,
            method_payment: method,
            status: ETransactionStatus.PENDING,
            user_id: userId,
            description: `Payment for transaction from VNPAY: type_transaction [${type}] with amount [${amount}] VND`,
            payment_order_id: orderId,
            payment_request_id: requestId,
            payment_order_info: orderInfo
        })

        await transaction.save()


      // Lấy IP từ request
      const clientIp = '127.0.0.1';

      // Tạo transaction reference
      const vnp_TxnRef = orderId;
      const locale = 'vn'
      const returnUrl = vnpayConfig.vnp_ReturnUrl
      const bankCode = ''

      // Tạo payment URL
      const paymentUrl = createPaymentUrl(
        vnp_TxnRef,
        amount,
        orderInfo,
        clientIp,
        bankCode,
        locale,
        returnUrl
      );

      res.status(HttpStatus.OK).json({
        code: '00',
        message: 'Success',
        data: {
          paymentUrl,
          vnp_TxnRef,
          amount,
          orderInfo,
        },
      });

    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({
        code: '99',
        message: 'Internal server error',
      });
    }
  }),

  /**
   * Xử lý return URL từ VNPay
   */
  handleReturn: expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const query = req.query;

        // 1. Kiểm tra chữ ký ngay lập tức
        if (!verifyReturnHash(query)) {
            res.status(HttpStatus.BAD_REQUEST).json({ code: '97', message: 'Invalid Signature' });
            return;
        }

        const { vnp_ResponseCode, vnp_TxnRef, vnp_Amount } = query;

        // 2. Tìm transaction để lấy thông tin hiển thị
        const transaction = await WalletTransaction.findOne({ payment_order_id: vnp_TxnRef as string });
        if (!transaction) {
            res.status(HttpStatus.NOT_FOUND).json({ code: '01', message: 'Order Not Found' });
            return;
        }

        // 3. Xác định trạng thái thanh toán dựa trên ResponseCode
        // Mã '00' là thành công, còn lại là lỗi (User hủy, thiếu số dư, lỗi mạng...)
        const isSuccess = vnp_ResponseCode === '00';
        const displayAmount = (Number(vnp_Amount) / 100).toLocaleString('vi-VN');

        // 4. Trả về kết quả cho Frontend hiển thị
        // Lưu ý: Chúng ta không update status ở đây, chỉ "đọc" trạng thái hiện tại
        res.status(HttpStatus.OK).json({
            code: isSuccess ? '00' : vnp_ResponseCode,
            status: isSuccess ? 'Success' : 'Failed',
            message: isSuccess ? 'Giao dịch thành công' : 'Giao dịch không thành công hoặc bị hủy',
            data: {
                orderId: vnp_TxnRef,
                amount: displayAmount,
                bankCode: query.vnp_BankCode,
                transactionNo: query.vnp_TransactionNo,
                payDate: formatDate(query.vnp_PayDate as string),
                // Trả về object transaction để FE lấy thông tin ví/user nếu cần
                transaction 
            },
        });

    } catch (error) {
        logger.error('Handle return error:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            code: '99',
            message: 'Hệ thống đang bận, vui lòng kiểm tra lịch sử giao dịch',
        });
    }
  }),

  /**
   * Xử lý Instant Payment Notification (IPN) từ VNPay
   * QUAN TRỌNG: Endpoint này phải luôn trả về response đúng format cho VNPay
   */
  vnpayIpn: expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('=== VNPAY IPN HIT ===');
      console.log(req.query);

      const {
        vnp_TxnRef,
        vnp_TransactionNo,
        vnp_ResponseCode,
        vnp_PayDate,
        vnp_TransactionStatus
      } = req.query;
    
      const isValid = verifySecureHash(
        req.query as any,
        vnpayConfig.vnp_HashSecret as string
      );

      if (!isValid) {
        res.status(HttpStatus.OK).json({ RspCode: '97', Message: 'Invalid signature' });
        return;
      }

      const session = await mongoose.startSession();

      try {
        let rspCode = '00';
        let message = 'Confirm Success';

        await session.withTransaction(async () => {
          const transaction = await WalletTransaction.findOne(
            { payment_order_id: vnp_TxnRef },
            null,
            { session }
          );

          if (!transaction) {
            rspCode = '01'; message = 'Order not found';
            return; // Thoát khỏi transaction block
          }

          if (transaction.status !== ETransactionStatus.PENDING) {
            rspCode = '02'; message = 'Order already confirmed';
            return;
          }

          // 🔐 validate amount
          const vnpAmount = Number(req.query.vnp_Amount) / 100;
          if (vnpAmount !== transaction.amount) {
            rspCode = '04'; message = 'Invalid amount';
            return;
          }

          const success =
            vnp_ResponseCode === '00' &&
            vnp_TransactionStatus === '00';

          if (success) {
            transaction.status = ETransactionStatus.COMPLETED;
            transaction.vnp_ResponseCode = vnp_ResponseCode as string;
            transaction.vnp_TransactionNo = vnp_TransactionNo as string;
            transaction.vnp_PayDate = formatDate(vnp_PayDate as string);

            await transaction.save({ session });

            await Wallet.findByIdAndUpdate(
              transaction.wallet_id,
              { $inc: { balance: transaction.amount } },
              { session }
            );
          } else {
            transaction.status = ETransactionStatus.FAILED;
            await transaction.save({ session });
          }
        });

        res.json({ RspCode: rspCode, Message: message });

      } catch (err) {
        res.json({ RspCode: '99', Message: 'Error' });
      } finally {
        session.endSession();
      }
    } catch (err) {
      console.error('IPN error:', err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        RspCode: '99',
        Message: 'Unknown error'
      });
    }
  }),

  /**
   * Query transaction status từ VNPay
   */
  queryTransaction: expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { payment_order_id } = req.query;

      if (!payment_order_id) {
        res.status(HttpStatus.BAD_REQUEST).json({
          code: '01',
          message: 'Missing payment_order_id',
        });
        return;
      }

      // Tìm order trong database
      const query: any = {};

      if (payment_order_id) query.vnp_TxnRef = payment_order_id;

      const transaction = await WalletTransaction.findOne({
        payment_order_id: payment_order_id
      });

      if (!transaction) {
        res.status(HttpStatus.NOT_FOUND).json({
          code: '02',
          message: 'Order not found',
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        code: '00',
        message: 'Success',
        data: {
          payment_order_id: transaction.payment_order_id,
          amount: transaction.amount,
          status: transaction.status,
          vnp_ResponseCode: transaction.vnp_ResponseCode,
          vnp_TransactionNo: transaction.vnp_TransactionNo,
          vnp_PayDate: transaction.vnp_PayDate,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        },
      });

    } catch (error) {
      console.error('Query transaction error:', error);
      res.status(500).json({
        code: '99',
        message: 'Internal server error',
      });
    }
  }),

  /**
   * Refund transaction
   */
  refundTransaction: expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId, amount, transactionDate, transactionNo, user } = req.body;

      // Validate input
      if (!orderId || !amount || !transactionDate || !transactionNo) {
        res.status(HttpStatus.BAD_REQUEST).json({
          code: '01',
          message: 'Missing required fields',
        });
        return;
      }

      // Tìm order
      const transaction = await WalletTransaction.findOne({ payment_order_id: orderId });
      if (!transaction) {
        res.status(HttpStatus.NOT_FOUND).json({
          code: '02',
          message: 'Order not found',
        });
        return;
      }

      if (transaction.status !== ETransactionStatus.COMPLETED) {
        res.status(HttpStatus.BAD_REQUEST).json({
          code: '03',
          message: 'Order is not paid',
        });
        return;
      }

      // Tạo hash cho refund request
      const date = new Date();
      const createDate = date.toISOString().replace(/[-:]/g, '').split('.')[0];

      const params: any = {
        vnp_RequestId: `REFUND_${orderId}_${Date.now()}`,
        vnp_Version: '2.1.0',
        vnp_Command: 'refund',
        vnp_TmnCode: vnpayConfig.vnp_TmnCode,
        vnp_TransactionType: '02',
        vnp_TxnRef: transaction.payment_order_id,
        vnp_Amount: amount * 100,
        vnp_TransactionNo: transactionNo,
        vnp_TransactionDate: transactionDate,
        vnp_CreateBy: user || 'admin',
        vnp_CreateDate: createDate,
        vnp_IpAddr: '127.0.0.1',
        vnp_OrderInfo: `Refund order ${orderId}`,
      };

      // Sort và tạo hash
      const sortedParams = sortObject(params);
      const signData = Object.keys(sortedParams)
        .map(key => `${key}=${sortedParams[key]}`)
        .join('&');
      
      const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
      const secureHash = crypto
        .createHmac('sha512', process.env.VNP_HASH_SECRET || '')
        .update(signData, 'utf-8')
        .digest('hex');
      params['vnp_SecureHash'] = secureHash;
      
      console.log('SIGN DATA:', signData);
      console.log('HASH SECRET:', process.env.VNP_HASHSECRET);
      console.log('SECURE HASH:', secureHash);

      // Gọi API refund của VNPay
      const response = await fetch(vnpayConfig.vnp_ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const result:any = await response.json();

      if (result.vnp_ResponseCode === '00') {
        // Cập nhật trạng thái refund
        transaction.status = ETransactionStatus.COMPLETED;
        await transaction.save();
      }

      res.status(HttpStatus.OK).json({
        code: result.vnp_ResponseCode,
        message: result.vnp_Message,
        data: result,
      });

    } catch (error) {
      console.error('Refund error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: '99',
        message: 'Internal server error',
      });
    }
  })
}