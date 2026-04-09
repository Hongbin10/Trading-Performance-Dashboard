import { Box, Paper, Skeleton, Typography } from '@mui/material'

interface Props {
  label:     string
  value:     string | number
  sub?:      string
  positive?: boolean   // true = green, false = red, undefined = neutral
  loading?:  boolean
}

export default function MetricCard({ label, value, sub, positive, loading }: Props) {
  const valueColor =
    positive === true  ? 'success.main' :
    positive === false ? 'error.main'   : 'text.primary'

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block', mb: 1,
              textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.7rem' }}
      >
        {label}
      </Typography>

      {loading ? (
        <Skeleton variant="text" width="60%" height={32} />
      ) : (
        <Typography
          sx={{
            fontSize: '1.2rem',
            fontWeight: 600,
            fontFamily: '"IBM Plex Mono", monospace',
            color: valueColor,
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
      )}

      {sub && (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {sub}
        </Typography>
      )}
    </Paper>
  )
}
