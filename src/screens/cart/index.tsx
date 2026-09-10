'use client'

import Link from 'next/link'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import { Box, Button, Card, Grid, IconButton, Stack, Typography } from '@mui/material'

import { BackButton } from '@/components/back-button'

import { formatBRL } from '@/utils/format'

import { cartContent } from '@/content/cart'
import { useCartStore } from '@/stores/cart'

import { cartPageStyles } from './style'

const EmptyCart = () => (
  <Stack spacing={2} sx={cartPageStyles.emptyState}>
    <Typography>{cartContent.empty}</Typography>
    <Button component={Link} href="/" variant="outlined">
      {cartContent.emptyCta}
    </Button>
  </Stack>
)

interface CartItemRowProps {
  title: string
  price: number
  onRemove: () => void
}

const CartItemRow = ({ title, price, onRemove }: CartItemRowProps) => (
  <Card component="li" variant="outlined" sx={cartPageStyles.itemCard}>
    <Box sx={cartPageStyles.itemBody}>
      <Box>
        <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {cartContent.offerLabel}
        </Typography>
        <Typography sx={cartPageStyles.itemPrice}>{formatBRL(price)}</Typography>
      </Box>
      <IconButton
        size="small"
        color="error"
        onClick={onRemove}
        aria-label={cartContent.removeAria(title)}
      >
        <DeleteOutlinedIcon />
      </IconButton>
    </Box>
  </Card>
)

export const CartPage = () => {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total)
  const remove = useCartStore((state) => state.remove)

  return (
    <Grid container sx={cartPageStyles.pageContainer}>
      <Grid size={{ xs: 12, md: 10, lg: 8 }}>
        <BackButton />
        <Box component="header" sx={cartPageStyles.pageHeader}>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
            {cartContent.title}
          </Typography>
          <Typography variant="body2" sx={cartPageStyles.pageSubtitle}>
            {cartContent.subtitle}
          </Typography>
        </Box>
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <Stack component="ul" spacing={2} sx={cartPageStyles.itemList}>
              {items.map((offer) => (
                <CartItemRow
                  key={offer.id}
                  title={offer.title}
                  price={offer.offerPrice}
                  onRemove={() => remove(offer.id)}
                />
              ))}
            </Stack>
            <Box sx={cartPageStyles.totalRow}>
              <Typography variant="h6">{cartContent.totalLabel}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatBRL(total)}
              </Typography>
            </Box>
            <Button
              fullWidth
              component={Link}
              href="/checkout"
              variant="contained"
              sx={cartPageStyles.checkoutButton}
            >
              {cartContent.checkoutCta}
            </Button>
          </>
        )}
      </Grid>
    </Grid>
  )
}
