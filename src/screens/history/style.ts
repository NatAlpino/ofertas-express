import type { SxProps, Theme } from '@mui/material'

export const historyPageStyles = {
  pageContainer: {
    justifyContent: 'center',
    px: { xs: 2, md: 3 },
    py: { xs: 3, md: 4 },
  },
  pageHeader: { mb: 3, mt: 1 },
  pageSubtitle: { color: 'text.secondary', mt: 0.5 },
  emptyState: { alignItems: 'center', py: 8 },
  entryList: { listStyle: 'none', m: 0, p: 0 },
  entryCard: { p: 2 },
  entryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
  },
  entryMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 3,
    mt: 1,
  },
  metaLabel: { color: 'text.secondary' },
  metaValue: { fontWeight: 600 },
} satisfies Record<string, SxProps<Theme>>
