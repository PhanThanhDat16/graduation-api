import { ETransactionStatus } from "./wallet.constants";

// ─── MoMo Create Payment Request ─────────────────────────────────
export interface MoMoCreatePaymentRequest {
  partnerCode: string;
  partnerName: string;
  storeId: string;
  requestId: string;
  amount: number;
  orderId: string;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
  lang: string;
  requestType: string;
  autoCapture: boolean;
  extraData: string;
  signature: string;
}

// ─── MoMo Create Payment Response ────────────────────────────────
export interface MoMoCreatePaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  qrCodeUrl: string;
  deeplink: string;
  deeplinkMiniApp: string;
}

// ─── MoMo Callback (IPN) Body ────────────────────────────────────
export interface MoMoCallbackBody {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

// ─── Create Payment Response (to client) ─────────────────────────
export interface CreatePaymentResponse {
  orderId: string;
  qrCodeUrl: string;
  payUrl: string;
}

// status response from momo
export interface ITransactionStatusResponse {
  paymentOrderId: string;
  fullName: string;
  email: string;
  amount: number;
  status: ETransactionStatus;
  paymentRequestId: string;
  createdAt: Date;
  updatedAt: Date;
}

