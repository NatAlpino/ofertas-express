'use client'

import { Avatar, Box, Card, Grid, Typography } from '@mui/material'

import { BackButton } from '@/components/back-button'

import { profileContent } from '@/content/profile'

import { useSessionStore } from '@/stores/session'

import { profilePageStyles } from './style'

const buildEmail = (username: string) => {
  const local = username.trim().toLowerCase().replace(/\s+/g, '.') || 'usuario'
  return `${local}${profileContent.emailDomain}`
}

const initialOf = (username: string) => username.trim().charAt(0).toUpperCase() || '?'

export const ProfilePage = () => {
  const username = useSessionStore((state) => state.username) ?? ''

  return (
    <Grid container sx={profilePageStyles.pageContainer}>
      <Grid size={{ xs: 12, md: 10, lg: 8 }}>
        <BackButton />
        <Box component="header" sx={profilePageStyles.pageHeader}>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
            {profileContent.title}
          </Typography>
          <Typography variant="body2" sx={profilePageStyles.pageSubtitle}>
            {profileContent.subtitle}
          </Typography>
        </Box>
        <Card variant="outlined" sx={profilePageStyles.card}>
          <Box sx={profilePageStyles.cardBody}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              {initialOf(username)}
            </Avatar>
            <Box sx={profilePageStyles.fieldList}>
              <Box>
                <Typography variant="caption" sx={profilePageStyles.fieldLabel}>
                  {profileContent.nameLabel}
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>{username}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={profilePageStyles.fieldLabel}>
                  {profileContent.emailLabel}
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>{buildEmail(username)}</Typography>
              </Box>
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  )
}
