import { Box, Typography } from '@mui/material'

interface Props { message?: string }

export default function EmptyState({ message = 'No data available' }: Props) {
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', minHeight: 200,
      }}
    >
      <Typography variant="body2">{message}</Typography>
    </Box>
  )
}
