import type { Metadata } from 'next'

import { loginContent } from '@/content/login'
import { LoginPage } from '@/screens/login'

export const metadata: Metadata = { title: loginContent.title }

const LoginRoute = () => <LoginPage />

export default LoginRoute
