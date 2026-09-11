export interface Offer {
  id: string
  title: string
  originalDebt: number
  offerPrice: number
}

export type PaymentMethod = 'pix' | 'boleto'

export interface CheckoutRequest {
  offerIds: string[]
  paymentMethod?: PaymentMethod
}

export interface PixPaymentInstructions {
  qrCodePayload: string
  copyCode: string
}

export interface BoletoPaymentInstructions {
  barcode: string
  dueDate: string
}

export type PaymentInstructions =
  | { method: 'pix'; pix: PixPaymentInstructions }
  | { method: 'boleto'; boleto: BoletoPaymentInstructions }

export interface CheckoutResponse {
  agreementId: string
  status: 'confirmed'
  payment?: PaymentInstructions
}
