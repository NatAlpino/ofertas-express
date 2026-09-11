import type { Metadata } from 'next'

import { checkoutContent } from '@/content/checkout'
import { CheckoutPage } from '@/screens/checkout'

export const metadata: Metadata = { title: checkoutContent.title }

const CheckoutRoute = () => <CheckoutPage />

export default CheckoutRoute
