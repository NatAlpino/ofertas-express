'use client'


import { Alert, Box, Button, CircularProgress, Grid, Typography } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'


import { useOffers } from '@/hooks/use-offers'


import { commonContent } from '@/content/common'
import { offersContent } from '@/content/offers'


import { useCompletedOffersStore } from '@/stores/offers'


import type { Offer } from '@/types'


import { OfferCard } from './offer-card'
import { offersPageStyles } from './style'

const isSuccessCheckout = (searchParams: URLSearchParams | null) =>
  searchParams?.get('checkout') === 'sucesso'

export const visibleOffers = (offers: Offer[] | undefined, completedIds: string[]) =>
  (offers ?? []).filter((offer) => !completedIds.includes(offer.id))

const CheckoutSuccessMessage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSuccess = isSuccessCheckout(searchParams)

  useEffect(() => {
    if (isSuccess) router.replace('/home')
  }, [isSuccess, router])

  if (!isSuccess) return null

  return (
    <Alert severity="success" role="status" sx={offersPageStyles.successAlert}>
      {offersContent.checkoutSuccess}
    </Alert>
  )
}

const OffersLoading = () => (
  <Box role="status" sx={offersPageStyles.stateBox}>
    <CircularProgress size={28} aria-hidden />
    <Typography color="text.secondary">{offersContent.loadPending}</Typography>
  </Box>
)

interface OffersErrorProps {
  onRetry: () => void
}

const OffersError = ({ onRetry }: OffersErrorProps) => (
  <Box role="alert" sx={offersPageStyles.stateBox}>
    <Typography>{offersContent.loadError}</Typography>
    <Button variant="outlined" onClick={onRetry}>
      {commonContent.retry}
    </Button>
  </Box>
)

const OffersEmpty = () => (
  <Box role="status" sx={offersPageStyles.stateBox}>
    <Typography sx={offersPageStyles.emptyTitle}>{offersContent.emptyTitle}</Typography>
  </Box>
)

const OffersList = () => {
  const { data, isPending, isError, refetch } = useOffers()
  const completedIds = useCompletedOffersStore((state) => state.completedIds)

  if (isPending) return <OffersLoading />
  if (isError) return <OffersError onRetry={refetch} />

  const offers = visibleOffers(data, completedIds)
  if (offers.length === 0) return <OffersEmpty />

  return (
    <Grid container component="ul" spacing={2} sx={offersPageStyles.offerList}>
      {offers.map((offer) => (
        <Grid key={offer.id} component="li" size={{ xs: 12, md: 6 }}>
          <OfferCard offer={offer} />
        </Grid>
      ))}
    </Grid>
  )
}

export const HomePage = () => (
  <Grid container sx={offersPageStyles.pageContainer}>
    <Grid size={{ xs: 12, md: 10, lg: 8 }} sx={offersPageStyles.pageColumn}>
      <Suspense fallback={null}>
        <CheckoutSuccessMessage />
      </Suspense>
      <Box component="header" sx={offersPageStyles.pageHeader}>
        <Typography component="h1" variant="h5" sx={offersPageStyles.pageTitle}>
          {offersContent.title}
        </Typography>
        <Typography variant="body2" sx={offersPageStyles.pageSubtitle}>
          {offersContent.subtitle}
        </Typography>
      </Box>
      <OffersList />
    </Grid>
  </Grid>
)
