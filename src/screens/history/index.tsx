'use client'

import Link from 'next/link'

import { Box, Button, Card, Grid, Stack, Typography } from '@mui/material'

import { BackButton } from '@/components/back-button'

import { formatBRL, formatDate } from '@/utils/format'

import { checkoutContent } from '@/content/checkout'
import { historyContent } from '@/content/history'

import type { HistoryEntry, HistoryMethod } from '@/stores/history'
import { sortByPaidAtDesc, useHistoryStore } from '@/stores/history'

import { historyPageStyles } from './style'

const methodLabel = (method: HistoryMethod) => {
  if (method === 'pix') return checkoutContent.pix.label
  if (method === 'boleto') return checkoutContent.boleto.label
  return historyContent.directMethod
}

const EmptyHistory = () => (
  <Stack spacing={2} sx={historyPageStyles.emptyState}>
    <Typography>{historyContent.empty}</Typography>
    <Button component={Link} href="/" variant="outlined">
      {historyContent.emptyCta}
    </Button>
  </Stack>
)

const HistoryRow = ({ entry }: { entry: HistoryEntry }) => (
  <Card component="li" variant="outlined" sx={historyPageStyles.entryCard}>
    <Box sx={historyPageStyles.entryHeader}>
      <Box>
        <Typography variant="caption" sx={historyPageStyles.metaLabel}>
          {historyContent.offersLabel}
        </Typography>
        <Typography sx={{ fontWeight: 600 }}>{entry.titles.join(' · ')}</Typography>
      </Box>
      <Typography color="primary" sx={{ fontWeight: 700 }}>
        {formatBRL(entry.total)}
      </Typography>
    </Box>
    <Box sx={historyPageStyles.entryMeta}>
      <Box>
        <Typography variant="caption" sx={historyPageStyles.metaLabel}>
          {historyContent.dateLabel}
        </Typography>
        <Typography variant="body2" sx={historyPageStyles.metaValue}>
          {formatDate(entry.paidAt)}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" sx={historyPageStyles.metaLabel}>
          {historyContent.methodLabel}
        </Typography>
        <Typography variant="body2" sx={historyPageStyles.metaValue}>
          {methodLabel(entry.method)}
        </Typography>
      </Box>
    </Box>
  </Card>
)

export const HistoryPage = () => {
  const entries = useHistoryStore((state) => state.entries)

  return (
    <Grid container sx={historyPageStyles.pageContainer}>
      <Grid size={{ xs: 12, md: 10, lg: 8 }}>
        <BackButton />
        <Box component="header" sx={historyPageStyles.pageHeader}>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
            {historyContent.title}
          </Typography>
          <Typography variant="body2" sx={historyPageStyles.pageSubtitle}>
            {historyContent.subtitle}
          </Typography>
        </Box>
        {entries.length === 0 ? (
          <EmptyHistory />
        ) : (
          <Stack component="ul" spacing={2} sx={historyPageStyles.entryList}>
            {sortByPaidAtDesc(entries).map((entry) => (
              <HistoryRow key={entry.id} entry={entry} />
            ))}
          </Stack>
        )}
      </Grid>
    </Grid>
  )
}
