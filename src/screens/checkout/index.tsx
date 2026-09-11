'use client'

import {
  Box,
  Card,
  Grid,
  Alert,
  Radio,
  Button,
  RadioGroup,
  Typography,
  FormControlLabel,
  CircularProgress,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'


import { BackButton } from '@/components/back-button'


import { useCheckoutFlag } from '@/hooks/use-checkout-flag'
import { useConfirmCheckout } from '@/hooks/use-confirm-checkout'


import { checkoutContent } from '@/content/checkout'


import { formatBRL } from '@/utils/format'


import { useCartStore } from '@/stores/cart'
import type { HistoryMethod } from '@/stores/history'
import { useHistoryStore } from '@/stores/history'
import { useCompletedOffersStore } from '@/stores/offers'


import type { CheckoutRequest, Offer, PaymentInstructions, PaymentMethod } from '@/types'

import { PaymentInstructionsDialog } from './payment-instructions-dialog'
import { checkoutPageStyles } from './style'

const buildCheckoutRequest = (
  items: Offer[],
  isV2: boolean,
  paymentMethod: PaymentMethod
): CheckoutRequest => ({
  offerIds: items.map((offer) => offer.id),
  ...(isV2 ? { paymentMethod } : {}),
})

const offerIdsOf = (items: Offer[]) => items.map((offer) => offer.id)

const PaymentMethodOption = ({
  value,
  label,
  hint,
}: {
  value: PaymentMethod
  label: string
  hint: string
}) => (
  <FormControlLabel
    value={value}
    control={<Radio />}
    label={
      <Box>
        <Typography variant="body1">{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      </Box>
    }
  />
)

export const CheckoutPage = () => {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const count = useCartStore((state) => state.count)
  const total = useCartStore((state) => state.total)
  const clear = useCartStore((state) => state.clear)
  const markCompleted = useCompletedOffersStore((state) => state.markCompleted)
  const addHistory = useHistoryStore((state) => state.add)

  const { isPending: isFlagPending, isV2 } = useCheckoutFlag()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [instructions, setInstructions] = useState<PaymentInstructions | null>(null)
  const [agreement, setAgreement] = useState<{ id: string; method: HistoryMethod } | null>(null)

  const {
    mutate: confirmCheckout,
    isPending: isSubmitting,
    isError,
    error,
    reset,
  } = useConfirmCheckout()

  const isEmpty = count === 0

  useEffect(() => {
    if (isEmpty) router.replace('/carrinho')
  }, [isEmpty, router])

  if (isEmpty) return null

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    reset()
    setPaymentMethod(event.target.value as PaymentMethod)
  }

  const handleCloseDialog = () => setInstructions(null)

  const handleConclude = () => {
    if (agreement) {
      addHistory({
        id: agreement.id,
        titles: items.map((item) => item.title),
        total,
        method: agreement.method,
        paidAt: new Date().toISOString(),
      })
    }
    markCompleted(offerIdsOf(items))
    clear()
    setInstructions(null)
    setAgreement(null)
    router.push('/home')
  }

  const handleConfirm = () => {
    confirmCheckout(buildCheckoutRequest(items, isV2, paymentMethod), {
      onSuccess: (response) => {
        if (response.payment) {
          setAgreement({ id: response.agreementId, method: response.payment.method })
          setInstructions(response.payment)
          return
        }
        addHistory({
          id: response.agreementId,
          titles: items.map((item) => item.title),
          total,
          method: 'direct',
          paidAt: new Date().toISOString(),
        })
        markCompleted(offerIdsOf(items))
        clear()
        router.push('/?checkout=sucesso')
      },
    })
  }

  return (
    <Grid container sx={checkoutPageStyles.pageContainer}>
      <Grid size={{ xs: 12, md: 10, lg: 8 }}>
        <BackButton />
        <Box component="header" sx={checkoutPageStyles.pageHeader}>
          <Typography component="h1" variant="h5" sx={checkoutPageStyles.pageTitle}>
            {checkoutContent.title}
          </Typography>
          <Typography variant="body2" sx={checkoutPageStyles.pageSubtitle}>
            {checkoutContent.subtitle}
          </Typography>
        </Box>

        <Card variant="outlined" sx={checkoutPageStyles.summaryCard}>
          <Box sx={checkoutPageStyles.summaryRow}>
            <Typography variant="body2" color="text.secondary">
              {checkoutContent.selectedLabel}
            </Typography>
            <Typography variant="body2" sx={checkoutPageStyles.summaryCount}>
              {count}
            </Typography>
          </Box>
          <Box sx={checkoutPageStyles.summaryRow}>
            <Typography variant="body2" color="text.secondary">
              {checkoutContent.totalLabel}
            </Typography>
            <Typography variant="body1" sx={checkoutPageStyles.summaryTotal}>
              {formatBRL(total)}
            </Typography>
          </Box>
        </Card>

        {isFlagPending ? (
          <Box role="status" sx={checkoutPageStyles.flagPendingBox}>
            <CircularProgress size={28} aria-hidden />
            <Typography color="text.secondary">{checkoutContent.flagPending}</Typography>
          </Box>
        ) : (
          <>
            {isV2 && (
              <Box
                component="fieldset"
                aria-label={checkoutContent.paymentLegend}
                sx={checkoutPageStyles.paymentFieldset}
              >
                <Typography
                  component="legend"
                  variant="body2"
                  sx={checkoutPageStyles.paymentLegend}
                >
                  {checkoutContent.paymentLegend}
                </Typography>
                <RadioGroup
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                  sx={checkoutPageStyles.paymentGroup}
                >
                  <PaymentMethodOption
                    value="pix"
                    label={checkoutContent.pix.label}
                    hint={checkoutContent.pix.hint}
                  />
                  <PaymentMethodOption
                    value="boleto"
                    label={checkoutContent.boleto.label}
                    hint={checkoutContent.boleto.hint}
                  />
                </RadioGroup>
              </Box>
            )}

            {isError && (
              <Alert severity="error" role="alert" sx={checkoutPageStyles.errorAlert}>
                {error instanceof Error ? error.message : checkoutContent.genericError}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              onClick={handleConfirm}
              sx={checkoutPageStyles.confirmButton}
            >
              {isSubmitting
                ? checkoutContent.confirming
                : isV2
                  ? checkoutContent.confirmPayment
                  : checkoutContent.confirm}
            </Button>
          </>
        )}
      </Grid>

      <PaymentInstructionsDialog
        instructions={instructions}
        onCancel={handleCloseDialog}
        onConclude={handleConclude}
      />
    </Grid>
  )
}
