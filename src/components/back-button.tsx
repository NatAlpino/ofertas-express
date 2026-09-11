'use client'

import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { commonContent } from '@/content/common'

const backButtonStyles = {
  color: 'text.secondary',
  mb: 1,
  px: 0,
}

const canGoBack = () => (window.history.state?.idx ?? 0) > 0

export const BackButton = () => {
  const router = useRouter()

  const handleBack = () => {
    if (canGoBack()) {
      router.back()
    } else {
      router.push('/home')
    }
  }

  return (
    <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={backButtonStyles}>
      {commonContent.back}
    </Button>
  )
}
