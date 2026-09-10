'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'

import { formatDate } from '@/utils/format'

import type {
  BoletoPaymentInstructions,
  PaymentInstructions,
  PixPaymentInstructions,
} from '@/types'
import { paymentContent } from '@/content/payment'

import { checkoutPageStyles } from './style'

const copyText = async (text: string) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

const PixBody = ({ pix }: { pix: PixPaymentInstructions }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    void copyText(pix.copyCode).then(() => setCopied(true))
  }

  return (
    <>
      <DialogTitle>{paymentContent.pixTitle}</DialogTitle>
      <DialogContent sx={checkoutPageStyles.dialogContent}>
        <Box sx={checkoutPageStyles.qrWrap}>
          <QRCode value={pix.qrCodePayload} size={180} />
        </Box>
        <Box sx={checkoutPageStyles.codeRow}>
          <Box sx={checkoutPageStyles.codeBox}>
            <Typography variant="caption" color="text.secondary">
              {paymentContent.codeLabel}
            </Typography>
            <Typography variant="body2">{pix.copyCode}</Typography>
          </Box>
          <IconButton color="primary" onClick={handleCopy} aria-label={paymentContent.copyCode}>
            <ContentCopyIcon />
          </IconButton>
        </Box>
        {copied && (
          <Typography variant="body2" color="success.main">
            {paymentContent.codeCopied}
          </Typography>
        )}
        <Typography variant="body2" sx={checkoutPageStyles.validityText}>
          {paymentContent.pixValidity}
        </Typography>
      </DialogContent>
    </>
  )
}

const BoletoBody = ({ boleto }: { boleto: BoletoPaymentInstructions }) => (
  <>
    <DialogTitle>{paymentContent.boletoTitle}</DialogTitle>
    <DialogContent sx={checkoutPageStyles.dialogContent}>
      <Box sx={checkoutPageStyles.barcodeBox}>
        <Typography variant="caption" color="text.secondary">
          {paymentContent.barcodeLabel}
        </Typography>
        <Typography sx={checkoutPageStyles.barcodeValue}>{boleto.barcode}</Typography>
      </Box>
      <Box sx={checkoutPageStyles.dueRow}>
        <Typography variant="body2" color="text.secondary">
          {paymentContent.dueLabel}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatDate(boleto.dueDate)}
        </Typography>
      </Box>
      <Typography variant="body2" sx={checkoutPageStyles.validityText}>
        {paymentContent.boletoValidity}
      </Typography>
    </DialogContent>
  </>
)

interface PaymentInstructionsDialogProps {
  instructions: PaymentInstructions | null
  onCancel: () => void
  onConclude: () => void
}

export const PaymentInstructionsDialog = ({
  instructions,
  onCancel,
  onConclude,
}: PaymentInstructionsDialogProps) => (
  <Dialog open={instructions !== null} onClose={onCancel} fullWidth maxWidth="sm">
    {instructions?.method === 'pix' ? <PixBody pix={instructions.pix} /> : null}
    {instructions?.method === 'boleto' ? <BoletoBody boleto={instructions.boleto} /> : null}
    <DialogActions>
      <Button onClick={onCancel}>{paymentContent.cancel}</Button>
      <Button variant="contained" onClick={onConclude}>
        {paymentContent.finish}
      </Button>
    </DialogActions>
  </Dialog>
)
