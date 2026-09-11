import type { Metadata } from 'next'

import { historyContent } from '@/content/history'

import { HistoryPage } from '@/screens/history'

export const metadata: Metadata = { title: historyContent.title }

const HistoryRoute = () => <HistoryPage />

export default HistoryRoute
