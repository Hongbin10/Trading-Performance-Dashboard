import {
  Box, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Typography,
} from '@mui/material'
import DashboardIcon   from '@mui/icons-material/Dashboard'
import BarChartIcon    from '@mui/icons-material/BarChart'
import TableChartIcon  from '@mui/icons-material/TableChart'
import ShowChartIcon   from '@mui/icons-material/ShowChart'
import { useLocation, useNavigate } from 'react-router-dom'

const NAV = [
  { label: 'Overview',    path: '/',             icon: <DashboardIcon  fontSize="small" /> },
  { label: 'Strategies',  path: '/strategies',   icon: <BarChartIcon   fontSize="small" /> },
  { label: 'Trade Log',   path: '/trades',       icon: <TableChartIcon fontSize="small" /> },
  { label: 'Performance', path: '/performance',  icon: <ShowChartIcon  fontSize="small" /> },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <Drawer variant="permanent">
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: 'primary.main',
            letterSpacing: '0.05em',
          }}
        >
          TRADING DESK
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.25, fontSize: '0.7rem' }}>
          QRT Dashboard · v0.1
        </Typography>
      </Box>

      {/* Nav items */}
      <List sx={{ px: 1, pt: 1.5 }} disablePadding>
        {NAV.map(({ label, path, icon }) => {
          const active = pathname === path
          return (
            <ListItemButton
              key={path}
              onClick={() => navigate(path)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                px: 1.5,
                py: 0.75,
                color: active ? 'primary.main' : 'text.secondary',
                bgcolor: active ? 'rgba(88,166,255,0.08)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', color: 'text.primary' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400 }}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Drawer>
  )
}
