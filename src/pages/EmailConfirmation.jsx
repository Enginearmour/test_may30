import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Truck, CheckCircle, XCircle } from 'lucide-react'

export default function EmailConfirmation() {
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token and type from URL query parameters
        const params = new URLSearchParams(location.hash.substring(1))
        const token = params.get('confirmation_token')
        const type = params.get('type')

        if (!token || type !== 'email_confirmation') {
          setStatus('error')
          setMessage('Invalid confirmation link')
          return
        }

        // Confirm the email
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email_confirmation'
        })

        if (error) {
          throw error
        }

        setStatus('success')
        setMessage('Your email has been confirmed successfully!')
      } catch (error) {
        console.error('Error confirming email:', error)
        setStatus('error')
        setMessage(error.message || 'Failed to confirm email')
      }
    }

    handleEmailConfirmation()
  }, [location])

  const goToLogin = () => {
    navigate('/login')
  }

  const goToHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="flex justify-center">
            <Truck className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Confirmation
          </h2>
        </div>

        <div className="mt-8">
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-lg">Confirming your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="mt-4 text-lg">{message}</p>
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={goToLogin}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Sign In
                </button>
                <button
                  onClick={goToHome}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go to Home
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="mt-4 text-lg">{message}</p>
              <div className="mt-6">
                <button
                  onClick={goToLogin}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
