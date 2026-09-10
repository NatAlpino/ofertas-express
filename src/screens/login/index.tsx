'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'
import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material'

import { commonContent } from '@/content/common'
import { loginContent } from '@/content/login'

import { useSessionStore } from '@/stores/session'

import { loginPageStyles } from './style'

export const LoginPage = () => {
  const router = useRouter()
  const login = useSessionStore((state) => state.login)
  const [username, setUsername] = useState('')

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    login(username)
    router.push('/')
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
