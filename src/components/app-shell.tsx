'use client'



import TagIcon from '@mui/icons-material/LocalOffer'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import ReceiptIcon from '@mui/icons-material/Receipt'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import {
  Box,
  List,
  Badge,
  Drawer,
  Divider,
  Toolbar,
  ListItem,
  IconButton,
  Typography,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  ListItemButton,
} from '@mui/material'
import type { SxProps, Theme } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { cartContent } from '@/content/cart'
import { checkoutContent } from '@/content/checkout'
import { commonContent } from '@/content/common'
import { historyContent } from '@/content/history'
import { navigationContent } from '@/content/navigation'
import { profileContent } from '@/content/profile'
import { resetAllStores } from '@/stores'
import { useCartStore } from '@/stores/cart'
import { useSessionStore } from '@/stores/session'

const DRAWER_WIDTH = 240
const LOGIN_ROUTE = '/login'

const appShellStyles = {
  navButton: { '&.Mui-selected': { bgcolor: 'primary.light' } },
  navIcon: { color: 'primary.main', minWidth: 40 },
  drawerRoot: { display: 'flex', flexDirection: 'column', height: '100%' },
  drawerToolbar: { flexDirection: 'column', alignItems: 'flex-start', gap: 0 },
  drawerTitle: { fontWeight: 700 },
  drawerNav: { flexGrow: 1 },
  logoutButton: { color: 'text.secondary' },
  logoutIcon: { color: 'inherit', minWidth: 40 },
  root: { display: 'flex', minHeight: '100vh' },
  appHeader: {
    position: 'fixed',
    top: 0,
    right: 0,
    left: { xs: 0, md: `${DRAWER_WIDTH}px` },
    zIndex: (muiTheme: Theme) => muiTheme.zIndex.drawer + 1,
    bgcolor: 'background.paper',
    borderBottom: 1,
    borderColor: 'divider',
  },
  appToolbar: { gap: 1 },
  appTitle: { flexGrow: 1, fontWeight: 700 },
  cartButton: { color: 'primary.main' },
  navWrapper: { width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } },
  drawerMobile: {
    display: { xs: 'block', md: 'none' },
    '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
  },
  drawerPermanent: {
    display: { xs: 'none', md: 'block' },
    '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
  },
  main: {
    flexGrow: 1,
    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
    pt: '64px',
  },
} satisfies Record<string, SxProps<Theme>>

const getPageTitle = (pathname: string | null) => {
  if (pathname?.startsWith('/carrinho')) return cartContent.title
  if (pathname?.startsWith('/checkout')) return checkoutContent.title
  if (pathname?.startsWith('/historico')) return historyContent.title
  if (pathname?.startsWith('/perfil')) return profileContent.title
  return commonContent.appName
}

const isRouteActive = (pathname: string | null, href: string) =>
  href === '/home' ? pathname === '/home' : pathname?.startsWith(href) === true

const NavigationItems = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname()
  const count = useCartStore((state) => state.count)

  const items = [
    { label: navigationContent.offers, href: '/home', icon: <TagIcon /> },
    {
      label: navigationContent.cart,
      href: '/carrinho',
      icon: <ShoppingCartIcon />,
      badge: count,
    },
    { label: navigationContent.history, href: '/historico', icon: <ReceiptIcon /> },
    { label: navigationContent.profile, href: '/perfil', icon: <PersonIcon /> },
  ]

  return (
    <List>
      {items.map((item) => (
        <ListItem key={item.label} disablePadding>
          <ListItemButton
            component={Link}
            href={item.href}
            selected={isRouteActive(pathname, item.href)}
            onClick={onNavigate}
            sx={appShellStyles.navButton}
          >
            <ListItemIcon sx={appShellStyles.navIcon}>
              {item.badge !== undefined && item.badge > 0 ? (
                <Badge badgeContent={item.badge} color="primary">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}

const DrawerContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const logout = useSessionStore((state) => state.logout)

  const handleLogout = () => {
    resetAllStores()
    queryClient.clear()
    logout()
    router.push(LOGIN_ROUTE)
  }

  return (
    <Box sx={appShellStyles.drawerRoot}>
      <Toolbar sx={appShellStyles.drawerToolbar}>
        <Typography variant="h6" color="primary" sx={appShellStyles.drawerTitle}>
          {commonContent.appName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {commonContent.appTagline}
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={appShellStyles.drawerNav}>
        <NavigationItems onNavigate={onNavigate} />
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={appShellStyles.logoutButton}>
            <ListItemIcon sx={appShellStyles.logoutIcon}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={navigationContent.exit} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )
}

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const pathname = usePathname()
  const router = useRouter()
  const count = useCartStore((state) => state.count)
  const username = useSessionStore((state) => state.username)

  const isLoginRoute = pathname === LOGIN_ROUTE

  useEffect(() => {
    if (!isLoginRoute && username === null) {
      router.replace(LOGIN_ROUTE)
    }
  }, [isLoginRoute, username, router])

  const openMenu = () => setMobileOpen(true)
  const closeMenu = () => setMobileOpen(false)

  if (isLoginRoute) return <>{children}</>

  return (
    <Box sx={appShellStyles.root}>
      <Box component="header" sx={appShellStyles.appHeader}>
        <Toolbar sx={appShellStyles.appToolbar}>
          {isMobile && (
            <IconButton
              edge="start"
              aria-label={navigationContent.menuButtonAria}
              onClick={openMenu}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={appShellStyles.appTitle}>
            {getPageTitle(pathname)}
          </Typography>
          <IconButton
            component={Link}
            href="/carrinho"
            aria-label={navigationContent.cartBadge(count)}
            sx={appShellStyles.cartButton}
          >
            <Badge
              badgeContent={count > 0 ? count : undefined}
              color="primary"
              role="status"
              aria-live="polite"
            >
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </Box>

      <Box component="nav" sx={appShellStyles.navWrapper}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeMenu}
          ModalProps={{ keepMounted: true }}
          sx={appShellStyles.drawerMobile}
        >
          <DrawerContent onNavigate={closeMenu} />
        </Drawer>
        <Drawer variant="permanent" open sx={appShellStyles.drawerPermanent}>
          <DrawerContent />
        </Drawer>
      </Box>

      <Box component="main" sx={appShellStyles.main}>
        {children}
      </Box>
    </Box>
  )
}
