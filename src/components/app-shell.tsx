'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import ReceiptIcon from '@mui/icons-material/Receipt'
import TagIcon from '@mui/icons-material/LocalOffer'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import {
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import type { Theme } from '@mui/material'

import { cartContent } from '@/content/cart'
import { useCartStore } from '@/stores/cart'
import { checkoutContent } from '@/content/checkout'
import { commonContent } from '@/content/common'
import { historyContent } from '@/content/history'
import { profileContent } from '@/content/profile'
import { navigationContent } from '@/content/navigation'
import { useSessionStore } from '@/stores/session'

const DRAWER_WIDTH = 240
const LOGIN_ROUTE = '/login'

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
            sx={{ '&.Mui-selected': { bgcolor: 'primary.light' } }}
          >
            <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
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
  const logout = useSessionStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    router.push(LOGIN_ROUTE)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
          {commonContent.appName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {commonContent.appTagline}
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ flexGrow: 1 }}>
        <NavigationItems onNavigate={onNavigate} />
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ color: 'text.secondary' }}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: { xs: 0, md: `${DRAWER_WIDTH}px` },
          zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton
              edge="start"
              aria-label={navigationContent.menuButtonAria}
              onClick={openMenu}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {getPageTitle(pathname)}
          </Typography>
          <IconButton
            component={Link}
            href="/carrinho"
            aria-label={navigationContent.cartBadge(count)}
            sx={{ color: 'primary.main' }}
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

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeMenu}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          <DrawerContent onNavigate={closeMenu} />
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          <DrawerContent />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          pt: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
