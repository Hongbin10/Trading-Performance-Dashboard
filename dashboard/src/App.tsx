import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Overview    from './pages/Overview'
import Strategies  from './pages/Strategies'
import TradeLog    from './pages/TradeLog'
import Performance from './pages/Performance'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"            element={<Overview />}    />
          <Route path="/strategies"  element={<Strategies />}  />
          <Route path="/trades"      element={<TradeLog />}    />
          <Route path="/performance" element={<Performance />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
