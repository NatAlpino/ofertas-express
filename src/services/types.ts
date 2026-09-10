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

export interface CheckoutResponse {
  agreementId: string
  status: 'confirmed'
}
