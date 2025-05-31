import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { QrCode, Truck } from 'lucide-react'

export default function ScanQR() {
  const navigate = useNavigate()
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState('')
  
  useEffect(() => {
    // Create QR code scanner
    const scanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 10,
    })
    
    const success = (decodedText) => {
      scanner.clear()
      setScanResult(decodedText)
      
      // Extract truck ID from URL
      try {
        const url = new URL(decodedText)
        const pathParts = url.pathname.split('/')
        const truckId = pathParts[pathParts.length - 1]
        
        if (truckId) {
          navigate(`/trucks/${truckId}`)
        } else {
          setError('Invalid QR code. Could not find truck ID.')
        }
      } catch (error) {
        console.error('Error parsing QR code URL:', error)
        setError('Invalid QR code format. Please scan a valid truck QR code.')
      }
    }
    
    const failure = (error) => {
      // Don't show errors during normal scanning
      if (error.includes('No QR code found')) return
      console.error('QR code scanning error:', error)
    }
    
    scanner.render(success, failure)
    
    return () => {
      // Clean up scanner when component unmounts
      try {
        scanner.clear()
      } catch (error) {
        console.error('Error cleaning up scanner:', error)
      }
    }
  }, [navigate])
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
        <QrCode className="h-6 w-6 mr-2 text-primary-600" />
        Scan Truck QR Code
      </h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Scan a truck's QR code to view its details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Position the QR code within the scanning area
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            {!scanResult ? (
              <div id="qr-reader" className="mx-auto max-w-lg"></div>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">QR Code Scanned</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Redirecting to truck details...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Instructions
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <ol className="list-decimal pl-5 space-y-2">
              <li className="text-gray-700">
                Allow camera access when prompted
              </li>
              <li className="text-gray-700">
                Position the truck's QR code within the scanning area
              </li>
              <li className="text-gray-700">
                Hold steady until the code is recognized
              </li>
              <li className="text-gray-700">
                You'll be automatically redirected to the truck's details page
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
