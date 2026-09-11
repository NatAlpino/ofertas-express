import type { Metadata } from 'next'

import { cartContent } from '@/content/cart'

import { CartPage } from '@/screens/cart'

export const metadata: Metadata = { title: cartContent.title }

const CartRoute = () => <CartPage />

export default CartRoute
