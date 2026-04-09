import {
  AppBar, Box, IconButton, MenuItem, Select,
  Snackbar, Alert, Toolbar, Tooltip, Typography,
} from '@mui/material'
import CircleIcon    from '@mui/icons-material/Circle'
import DarkModeIcon  from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useEffect, useState } from 'react'
import { BACKENDS, type BackendKey } from '../../api/client'
import { useBackend }    from '../../context/BackendContext'
import { useThemeMode }  from '../../context/ThemeContext'

export default function TopBar() {
  const { current, switchTo } = useBackend()
  const { mode, toggle }      = useThemeMode()
  const [now,   setNow]   = useState(new Date())
  const [snack, setSnack] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })

  const handleBackendChange = (key: BackendKey) => {
    if (key === 'python') {
      setSnack(true)
      return
    }
    switchTo(key)
  }

  return (
    <>
      <AppBar position="fixed" sx={{ left: 225, width: 'calc(100% - 225px)' }}>
        <Toolbar sx={{ minHeight: '52px !important', px: 2.5, gap: 2 }}>
          <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.8rem', color: 'text.secondary' }}>
            {dateStr}
          </Typography>
          <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.8rem', color: 'text.primary', letterSpacing: '0.05em' }}>
            {timeStr}
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              size="small"
              onClick={toggle}
              sx={{
                color: 'text.secondary',
                border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 0.75,
                '&:hover': { color: 'text.primary', borderColor: 'text.secondary' },
              }}
            >
              {mode === 'dark' ? <LightModeIcon sx={{ fontSize: 16 }} /> : <DarkModeIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>

          <Select
            size="small"
            value={current}
            onChange={(e) => handleBackendChange(e.target.value as BackendKey)}
            renderValue={(val) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CircleIcon sx={{ fontSize: '8px', color: '#3fb950' }} />
                <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.8rem', color: '#3fb950' }}>
                  {BACKENDS[val as BackendKey].label}
                </Typography>
              </Box>
            )}
            sx={{
              fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.8rem', color: '#3fb950',
              bgcolor: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.25)',
              borderRadius: 2,
              '.MuiOutlinedInput-notchedOutline': { border: 'none' },
              '.MuiSelect-icon': { color: '#3fb950' },
              minWidth: 200,
            }}
          >
            {(Object.entries(BACKENDS) as [BackendKey, typeof BACKENDS[BackendKey]][]).map(([key, val]) => (
              <MenuItem key={key} value={key} sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.8rem' }}>
                {val.label}
              </MenuItem>
            ))}
          </Select>
        </Toolbar>
      </AppBar>

      <Snackbar
        open={snack}
        autoHideDuration={5000}
        onClose={() => setSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          onClose={() => setSnack(false)}
          sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.9rem' }}
        >
          Python FastAPI is not running in this demo.
          <br /> 
          C# ASP.NET Core is the active backend.
        </Alert>
      </Snackbar>
    </>
  )
}