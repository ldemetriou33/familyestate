/**
 * Webhook Signature Validation Utilities
 * Ensures incoming webhooks are authentic (not from hackers)
 */

import crypto from 'crypto'

// ============================================
// CLOUDBEDS SIGNATURE VALIDATION
// ============================================

export function validateCloudbedsSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false
  
  // Cloudbeds uses HMAC-SHA256
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  // Timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

// ============================================
// SQUARE SIGNATURE VALIDATION
// ============================================

export function validateSquareSignature(
  payload: string,
  signature: string | null,
  signatureKey: string,
  notificationUrl: string
): boolean {
  if (!signature || !signatureKey) return false
  
  // Square signature = HMAC-SHA256(notificationUrl + payload)
  const stringToSign = notificationUrl + payload
  
  const expectedSignature = crypto
    .createHmac('sha256', signatureKey)
    .update(stringToSign)
    .digest('base64')
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

// ============================================
// XERO SIGNATURE VALIDATION
// ============================================

export function validateXeroSignature(
  payload: string,
  signature: string | null,
  webhookKey: string
): boolean {
  if (!signature || !webhookKey) return false
  
  // Xero uses HMAC-SHA256 with base64 encoding
  const expectedSignature = crypto
    .createHmac('sha256', webhookKey)
    .update(payload)
    .digest('base64')
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

// ============================================
// GENERIC HMAC VALIDATION
// ============================================

export function validateHmacSignature(
  payload: string,
  signature: string | null,
  secret: string,
  algorithm: 'sha256' | 'sha1' = 'sha256',
  encoding: 'hex' | 'base64' = 'hex'
): boolean {
  if (!signature || !secret) return false
  
  const expectedSignature = crypto
    .createHmac(algorithm, secret)
    .update(payload)
    .digest(encoding)
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

