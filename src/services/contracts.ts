import type { CheckoutResponse, Offer, PaymentInstructions } from '@/types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isOffer = (value: unknown): value is Offer => {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.originalDebt === 'number' &&
    typeof value.offerPrice === 'number'
  )
}

export const parseOffers = (data: unknown): Offer[] => {
  if (data === null) return []
  if (!Array.isArray(data) || !data.every(isOffer)) {
    throw new Error('Invalid offers payload')
  }
  return data
}

export const parseCheckoutFlag = (data: unknown): { enabled: boolean } => ({
  enabled: isRecord(data) && data.enabled === true,
})

const isPaymentInstructions = (value: unknown): value is PaymentInstructions => {
  if (!isRecord(value)) return false
  if (value.method === 'pix') {
    return (
      isRecord(value.pix) &&
      typeof value.pix.qrCodePayload === 'string' &&
      typeof value.pix.copyCode === 'string'
    )
  }
  if (value.method === 'boleto') {
    return (
      isRecord(value.boleto) &&
      typeof value.boleto.barcode === 'string' &&
      typeof value.boleto.dueDate === 'string'
    )
  }
  return false
}

export const parseCheckoutResponse = (data: unknown): CheckoutResponse => {
  if (!isRecord(data) || typeof data.agreementId !== 'string' || data.status !== 'confirmed') {
    throw new Error('Invalid checkout response')
  }
  if (data.payment !== undefined && !isPaymentInstructions(data.payment)) {
    throw new Error('Invalid checkout response')
  }
  return {
    agreementId: data.agreementId,
    status: 'confirmed',
    payment: data.payment as PaymentInstructions | undefined,
  }
}
