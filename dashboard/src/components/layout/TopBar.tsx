import { AppBar, Box, MenuItem, Select, Toolbar, Typography } from '@mui/material'
import CircleIcon from '@mui/icons-material/Circle'
import { BACKENDS, type BackendKey } from '../../api/client'
import { useBackend } from '../../context/BackendContext'

export default function TopBar() {
  const { current, switchTo } = useBackend()

  const now = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <AppBar position="fixed" sx={{ left: 220, width: 'calc(100% - 220px)' }}>
      <Toolbar sx={{ minHeight: '52px !important', px: 2.5, gap: 2 }}>
        <Typography
          sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: 'text.secondary' }}
        >
          {now}
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Select
          size="small"
          value={current}
          onChange={(e) => switchTo(e.target.value as BackendKey)}
          renderValue={(val) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CircleIcon sx={{ fontSize: '8px', color: '#3fb950' }} />
              <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.72rem', color: '#3fb950' }}>
                {BACKENDS[val as BackendKey].label}
              </Typography>
            </Box>
          )}
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.72rem',
            color: '#3fb950',
            bgcolor: 'rgba(63,185,80,0.08)',
            border: '1px solid rgba(63,185,80,0.25)',
            borderRadius: 2,
            '.MuiOutlinedInput-notchedOutline': { border: 'none' },
            '.MuiSelect-icon': { color: '#3fb950' },
            minWidth: 200,
          }}
        >
          {(Object.entries(BACKENDS) as [BackendKey, typeof BACKENDS[BackendKey]][]).map(([key, val]) => (
            <MenuItem
              key={key}
              value={key}
              sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.8rem' }}
            >
              {val.label}
            </MenuItem>
          ))}
        </Select>
      </Toolbar>
    </AppBar>
  )
}
