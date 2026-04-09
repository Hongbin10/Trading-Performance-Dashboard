import { Box, CircularProgress, Typography } from '@mui/material'

export default function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
               justifyContent: 'center', height: '100%', minHeight: 240, gap: 2 }}>
      <CircularProgress size={28} thickness={3} sx={{ color: '#f0a500' }} />
      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary',
                        fontFamily: '"IBM Plex Mono", monospace' }}>
        {message}
      </Typography>
    </Box>
  )
}
