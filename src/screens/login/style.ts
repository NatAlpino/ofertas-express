import type { SxProps, Theme } from '@mui/material'

export const loginPageStyles = {
  pageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    px: { xs: 2, md: 3 },
    py: { xs: 3, md: 4 },
  },
  card: { p: { xs: 3, md: 4 }, width: '100%' },
  cardContent: { display: 'flex', flexDirection: 'column', gap: 2 },
  header: { mb: 2, textAlign: 'center' },
  subtitle: { color: 'text.secondary', mt: 0.5 },
  submitButton: { mt: 2 },
} satisfies Record<string, SxProps<Theme>>
