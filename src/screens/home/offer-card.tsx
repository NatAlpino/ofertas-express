'use client'

import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material'

import { offersContent } from '@/content/offers'
import { useCartStore } from '@/stores/cart'
import type { Offer } from '@/types'
import { discountPercent, formatBRL } from '@/utils/format'


import { offersPageStyles } from './style'

const containsOffer = (items: Offer[], offerId: string) => items.some((item) => item.id === offerId)

interface OfferCardProps {
  offer: Offer
}

export const OfferCard = ({ offer }: OfferCardProps) => {
  const items = useCartStore((state) => state.items)
  const add = useCartStore((state) => state.add)
  const added = containsOffer(items, offer.id)
  const percent = discountPercent(offer.originalDebt, offer.offerPrice)

  return (
    <Card variant="outlined" sx={offersPageStyles.card}>
      <CardContent sx={offersPageStyles.cardContent}>
        <Stack direction="row" spacing={2} sx={offersPageStyles.cardHeader}>
          <Typography component="h3" variant="h6" sx={{ fontWeight: 700 }}>
            {offer.title}
          </Typography>
          <Chip label={offersContent.discountBadge(percent)} color="primary" size="small" />
        </Stack>
        <Stack direction="row" spacing={4} sx={offersPageStyles.cardPrices}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {offersContent.debtLabel}
            </Typography>
            <Typography sx={offersPageStyles.debtValue}>{formatBRL(offer.originalDebt)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {offersContent.offerLabel}
            </Typography>
            <Typography color="primary" sx={{ fontWeight: 700 }}>
              {formatBRL(offer.offerPrice)}
            </Typography>
          </Box>
        </Stack>
        <Button
          fullWidth
          variant={added ? 'outlined' : 'contained'}
          disabled={added}
          onClick={() => add(offer)}
          aria-label={
            added ? offersContent.inCartAria(offer.title) : offersContent.addToCartAria(offer.title)
          }
        >
          {added ? offersContent.inCart : offersContent.addToCart}
        </Button>
      </CardContent>
    </Card>
  )
}
