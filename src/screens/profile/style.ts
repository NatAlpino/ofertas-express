import type { SxProps, Theme } from '@mui/material'

export const profilePageStyles = {
  pageContainer: {
    justifyContent: 'center',
    px: { xs: 2, md: 3 },
    py: { xs: 3, md: 4 },
  },
  pageHeader: { mb: 3, mt: 1 },
  pageSubtitle: { color: 'text.secondary', mt: 0.5 },
  card: { p: { xs: 3, md: 4 } },
  cardBody: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  fieldList: { display: 'flex', flexDirection: 'column', gap: 1 },
  fieldLabel: { color: 'text.secondary' },
} satisfies Record<string, SxProps<Theme>>
