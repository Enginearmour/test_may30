import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import EmailConfirmation from './pages/EmailConfirmation'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/trucks" element={<PrivateRoute><div>Trucks Page</div></PrivateRoute>} />
        <Route path="/scan" element={<PrivateRoute><div>Scan QR Page</div></PrivateRoute>} />
        <Route path="/company" element={<PrivateRoute><div>Company Page</div></PrivateRoute>} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/email-confirmation" element={<EmailConfirmation />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
