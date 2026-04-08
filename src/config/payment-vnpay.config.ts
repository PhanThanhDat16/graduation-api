// src/config/vnpay.config.ts
import dotenv from 'dotenv';

dotenv.config();

export interface VNPayConfig {
  vnp_TmnCode: string;
  vnp_HashSecret: string;
  vnp_Url: string;
  vnp_ReturnUrl: string;
  vnp_IpnUrl: string;
  vnp_ApiUrl: string;
  vnp_Version: string;
  vnp_Command: string;
  vnp_CurrCode: string;
  vnp_Locale: string;
  vnp_OrderType: string;
}

const vnpayConfig: VNPayConfig = {
  vnp_TmnCode: process.env.VNP_TMNCODE || '',
  vnp_HashSecret: process.env.VNP_HASH_SECRET || '',
  vnp_Url: process.env.VNPAY_URL || '',
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || '',
  vnp_IpnUrl: process.env.VNPAY_IPN_URL || '',
  vnp_ApiUrl: process.env.VNPAY_API_URL || '',
  vnp_Version: '2.1.0',
  vnp_Command: 'pay',
  vnp_CurrCode: 'VND',
  vnp_Locale: 'vn', // vn, en
  vnp_OrderType: 'other',
};

export default vnpayConfig;