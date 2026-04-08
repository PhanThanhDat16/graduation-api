import crypto from 'crypto';
import moment from 'moment';
import qs from 'qs';
import vnpayConfig from '../config/payment-vnpay.config';
import { ETransactionStatus } from '@/constants/wallet.constants';

/* ===================== TYPES ===================== */
export interface VNPayPaymentParams {
  [key: string]: string | number | undefined;

  vnp_Version: string;
  vnp_Command: string;
  vnp_TmnCode: string;
  vnp_Amount: number;
  vnp_CreateDate: string;
  vnp_CurrCode: string;
  vnp_IpAddr: string;
  vnp_Locale: string;
  vnp_OrderInfo: string;
  vnp_OrderType: string;
  vnp_ReturnUrl: string;
  vnp_TxnRef: string;
  vnp_ExpireDate: string;
  vnp_SecureHash?: string;
  vnp_BankCode?: string;
}

/* ===================== HELPERS ===================== */
export function sortObject(obj: Record<string, any>) {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();

  keys.forEach((key) => {
    sorted[key] = obj[key].toString();
  });

  return sorted;
}

/* ===================== HASH ===================== */
export const createVNPayHash = (
  params: Record<string, string | number>,
  hashSecret: string
): string => {
  const sortedKeys = Object.keys(params).sort();

  const signData = sortedKeys
    .map(key => {
      return (
        key +
        '=' +
        encodeURIComponent(String(params[key])).replace(/%20/g, '+')
      );
    })
    .join('&');

  console.log('🔐 SIGN DATA (HASH):', signData);

  return crypto
    .createHmac('sha512', hashSecret)
    .update(signData, 'utf-8')
    .digest('hex');
};

/* ===================== CREATE PAYMENT URL ===================== */
export const createPaymentUrl = (
  vnp_TxnRef: string,
  amount: number,
  orderInfo: string,
  clientIp: string,
  bankCode?: string,
  locale = 'vn',
  returnUrl?: string
): string => {
  const date = new Date();

  const params: Record<string, any> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Amount: amount * 100,
    vnp_CreateDate: moment(date).format('YYYYMMDDHHmmss'),
    vnp_CurrCode: 'VND',
    vnp_IpAddr: clientIp,
    vnp_Locale: locale,
    vnp_OrderInfo: orderInfo, // ❌ KHÔNG encode
    vnp_OrderType: 'other',
    vnp_ReturnUrl: returnUrl || vnpayConfig.vnp_ReturnUrl,
    vnp_TxnRef: vnp_TxnRef,
    vnp_ExpireDate: moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss'),
  };

   if (bankCode) {
    params.vnp_BankCode = bankCode;
  }

  // 🔹 SORT KEY
  const sortedKeys = Object.keys(params).sort();

  // 🔐 TẠO HASH (ENCODE VALUE)
  const signData = sortedKeys
    .map(
      key =>
        key +
        '=' +
        encodeURIComponent(String(params[key])).replace(/%20/g, '+')
    )
    .join('&');

  const secureHash = crypto
    .createHmac('sha512', vnpayConfig.vnp_HashSecret)
    .update(signData, 'utf-8')
    .digest('hex');

  // ➕ ADD HASH
  params.vnp_SecureHash = secureHash;

  // 🔗 TẠO QUERY STRING (PHẢI GIỐNG HASH)
  const query = [...sortedKeys, 'vnp_SecureHash']
    .map(
      key =>
        key +
        '=' +
        encodeURIComponent(String(params[key])).replace(/%20/g, '+')
    )
    .join('&');

  return `${vnpayConfig.vnp_Url}?${query}`;
};


/* ===================== VERIFY RETURN / IPN ===================== */
export const verifyReturnHash = (query: Record<string, any>): boolean => {
  const vnp_Params = { ...query };
  const secureHash = vnp_Params.vnp_SecureHash;

  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const calculatedHash = createVNPayHash(
    vnp_Params,
    vnpayConfig.vnp_HashSecret
  );

  console.log('🔍 Verify Hash:', {
    received: secureHash,
    calculated: calculatedHash,
    match: secureHash === calculatedHash
  });

  return secureHash === calculatedHash;
};

/* ===================== RESPONSE HELPERS ===================== */
export const getResponseMessage = (responseCode: string): string => {
  const map: Record<string, string> = {
    '00': 'Giao dịch thành công',
    '07': 'Giao dịch nghi ngờ gian lận',
    '09': 'Chưa đăng ký Internet Banking',
    '10': 'Sai thông tin xác thực',
    '11': 'Hết hạn thanh toán',
    '12': 'Tài khoản bị khóa',
    '13': 'Sai OTP',
    '24': 'Khách hàng hủy giao dịch',
    '51': 'Không đủ số dư',
    '65': 'Vượt hạn mức',
    '75': 'Ngân hàng bảo trì',
    '79': 'Sai mật khẩu thanh toán',
    '99': 'Lỗi không xác định'
  };

  return map[responseCode] || 'Mã lỗi không xác định';
};

export const getPaymentStatusFromResponse = (
  responseCode: string
): ETransactionStatus => {
  if (responseCode === '00') return ETransactionStatus.COMPLETED;
  if (['24', '51', '65', '75'].includes(responseCode))
    return ETransactionStatus.FAILED;
  return ETransactionStatus.PENDING;
};

export function verifySecureHash(
  vnpParams: Record<string, any>,
  secretKey: string
): boolean {
  const params = { ...vnpParams };
  const receivedHash = params.vnp_SecureHash;
  
  if (!receivedHash) return false;

  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  // 1. Sắp xếp key theo Alphabet
  const sortedKeys = Object.keys(params).sort();

  // 2. Tạo chuỗi ký (BẮT BUỘC phải encode value giống lúc tạo link)
  const signData = sortedKeys
    .map(key => {
      // VNPAY 2.1.0 yêu cầu encode các ký tự đặc biệt và thay khoảng trắng bằng dấu cộng
      const value = encodeURIComponent(String(params[key])).replace(/%20/g, '+');
      return `${key}=${value}`;
    })
    .join('&');

  const calculatedHash = crypto
    .createHmac('sha512', secretKey)
    .update(signData, 'utf-8')
    .digest('hex');

  // Log để debug (Xóa khi lên production)
  console.log('--- IPN VERIFY DEBUG ---');
  console.log('SignData:', signData); 

  return receivedHash.toLowerCase() === calculatedHash.toLowerCase();
}

export const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const hour = dateStr.substring(8, 10);
  const minute = dateStr.substring(10, 12);
  const second = dateStr.substring(12, 14);
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
};