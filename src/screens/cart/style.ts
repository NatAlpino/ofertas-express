import type { SxProps, Theme } from '@mui/material'

export const cartPageStyles = {
  pageContainer: {
    justifyContent: 'center',
    px: { xs: 2, md: 3 },
    py: { xs: 3, md: 4 },
  },
  pageHeader: { mb: 3, mt: 1 },
  pageSubtitle: { color: 'text.secondary', mt: 0.5 },
  emptyState: { alignItems: 'center', py: 8 },
  itemList: { listStyle: 'none', m: 0, p: 0 },
  itemCard: { p: 2 },
  itemBody: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
  },
  itemPrice: { color: 'primary.main', fontWeight: 700 },
  totalRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mt: 3,
  },
  checkoutButton: { mt: 2 },
} satisfies Record<string, SxProps<Theme>>
