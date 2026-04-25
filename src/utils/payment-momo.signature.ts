import crypto from 'crypto'

/**
 * Create HMAC SHA256 signature from raw string and secret key.
 */
export function createSignature(rawSignature: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex')
}

/**
 * Build the raw signature string for MoMo payment creation.
 * Fields MUST be in alphabetical order as required by MoMo API.
 */
export function buildCreatePaymentRawSignature(params: {
  accessKey: string
  amount: number
  extraData: string
  ipnUrl: string
  orderId: string
  orderInfo: string
  partnerCode: string
  redirectUrl: string
  requestId: string
  requestType: string
}): string {
  return (
    `accessKey=${params.accessKey}` +
    `&amount=${params.amount}` +
    `&extraData=${params.extraData}` +
    `&ipnUrl=${params.ipnUrl}` +
    `&orderId=${params.orderId}` +
    `&orderInfo=${params.orderInfo}` +
    `&partnerCode=${params.partnerCode}` +
    `&redirectUrl=${params.redirectUrl}` +
    `&requestId=${params.requestId}` +
    `&requestType=${params.requestType}`
  )
}

/**
 * Build the raw signature string from a MoMo callback body.
 * Fields MUST be in alphabetical order as required by MoMo API.
 */
export function buildCallbackRawSignature(params: {
  accessKey: string
  amount: number
  extraData: string
  message: string
  orderId: string
  orderInfo: string
  orderType: string
  partnerCode: string
  payType: string
  requestId: string
  responseTime: number
  resultCode: number
  transId: number
}): string {
  return (
    `accessKey=${params.accessKey}` +
    `&amount=${params.amount}` +
    `&extraData=${params.extraData}` +
    `&message=${params.message}` +
    `&orderId=${params.orderId}` +
    `&orderInfo=${params.orderInfo}` +
    `&orderType=${params.orderType}` +
    `&partnerCode=${params.partnerCode}` +
    `&payType=${params.payType}` +
    `&requestId=${params.requestId}` +
    `&responseTime=${params.responseTime}` +
    `&resultCode=${params.resultCode}` +
    `&transId=${params.transId}`
  )
}

/**
 * Verify a MoMo callback signature.
 * Returns true if the signature is valid.
 */
export function verifyCallbackSignature(callbackSignature: string, rawSignature: string, secretKey: string): boolean {
  const computedSignature = createSignature(rawSignature, secretKey)
  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(callbackSignature, 'hex'), Buffer.from(computedSignature, 'hex'))
  } catch {
    return false
  }
}
