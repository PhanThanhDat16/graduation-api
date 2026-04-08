// src/routes/vnpay.routes.ts
import express from 'express';
import { vnpayController } from '@/controllers/payments/payment-vnpay.controller';
import { requireAuth } from '@/middlewares/auth.middlewares';

const router = express.Router();

// Tạo payment URL
router.post('/create', requireAuth, vnpayController.createPayment);

// Xử lý return URL từ VNPay
router.get('/return', vnpayController.handleReturn);

// Xử lý IPN từ VNPay
router.get('/ipn', vnpayController.vnpayIpn);
router.post('/ipn', vnpayController.vnpayIpn);

// Query transaction status
router.get('/query', vnpayController.queryTransaction);

// Refund transaction
router.post('/refund', vnpayController.refundTransaction);

export  const PaymentVnpayRouter = router;