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

export const BackButton = () => {
  const router = useRouter()

  return (
    <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={backButtonStyles}>
      {commonContent.back}
    </Button>
  )
}
