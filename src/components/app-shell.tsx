'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

import MenuIcon from '@mui/icons-material/Menu'
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
import { navigationContent } from '@/content/navigation'

const DRAWER_WIDTH = 240

const getPageTitle = (pathname: string | null) => {
  if (pathname?.startsWith('/carrinho')) return cartContent.title
  if (pathname?.startsWith('/checkout')) return checkoutContent.title
  return commonContent.appName
}

const isRouteActive = (pathname: string | null, href: string) =>
  href === '/' ? pathname === '/' : pathname?.startsWith(href) === true

const NavigationItems = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname()
  const count = useCartStore((state) => state.count)

  const items = [
    { label: navigationContent.offers, href: '/', icon: <TagIcon /> },
    {
      label: navigationContent.cart,
      href: '/carrinho',
      icon: <ShoppingCartIcon />,
      badge: count,
    },
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
    </Box>
  )
}

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const pathname = usePathname()
  const count = useCartStore((state) => state.count)

  const openMenu = () => setMobileOpen(true)
  const closeMenu = () => setMobileOpen(false)

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
