import type { Metadata } from 'next'

import { navigationContent } from '@/content/navigation'
import { HomePage } from '@/screens/home'

export const metadata: Metadata = { title: navigationContent.offers }

const HomeRoute = () => <HomePage />

export default HomeRoute
