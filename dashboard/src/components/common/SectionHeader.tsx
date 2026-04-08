import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface Props {
  title:    string
  action?:  ReactNode
}

export default function SectionHeader({ title, action }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="h3">{title}</Typography>
      {action}
    </Box>
  )
}
