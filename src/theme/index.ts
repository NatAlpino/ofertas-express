import { createTheme } from '@mui/material'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0d9488',
      dark: '#0f766e',
      light: '#ccfbf1',
      contrastText: '#ffffff',
    },
    success: {
      main: '#15803d',
    },
    error: {
      main: '#dc2626',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    divider: '#e2e8f0',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Geist", ui-sans-serif, system-ui, -apple-system, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
})
