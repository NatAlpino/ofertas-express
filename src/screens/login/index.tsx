'use client'

import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'


import { commonContent } from '@/content/common'
import { loginContent } from '@/content/login'

import { useSessionStore } from '@/stores/session'

import { resetAllStores } from '@/stores'

import { loginPageStyles } from './style'

export const LoginPage = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const login = useSessionStore((state) => state.login)
  const [username, setUsername] = useState('')

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = username.trim()
    if (!name) return
    resetAllStores()
    queryClient.clear()
    login(name)
    router.push('/home')
  }

  return (
    <Grid container sx={loginPageStyles.pageContainer}>
      <Grid size={{ xs: 12, sm: 8, md: 4 }}>
        <Card variant="outlined" sx={loginPageStyles.card}>
          <CardContent sx={loginPageStyles.cardContent}>
            <Box component="header" sx={loginPageStyles.header}>
              <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
                {commonContent.appName}
              </Typography>
              <Typography variant="body2" sx={loginPageStyles.subtitle}>
                {loginContent.subtitle}
              </Typography>
            </Box>
            <Box component="form" onSubmit={handleSubmit} sx={loginPageStyles.cardContent}>
              <TextField
                fullWidth
                required
                autoComplete="username"
                label={loginContent.userLabel}
                value={username}
                onChange={handleUsernameChange}
              />
              <TextField
                fullWidth
                type="password"
                autoComplete="current-password"
                label={loginContent.passwordLabel}
              />
              <Button fullWidth type="submit" variant="contained" sx={loginPageStyles.submitButton}>
                {loginContent.submit}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
