import type { Metadata } from 'next'

import { profileContent } from '@/content/profile'

import { ProfilePage } from '@/screens/profile'

export const metadata: Metadata = { title: profileContent.title }

const ProfileRoute = () => <ProfilePage />

export default ProfileRoute
