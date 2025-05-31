import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import QRCode from 'react-qr-code'
import { useReactToPrint } from 'react-to-print'
import { format, parseISO } from 'date-fns'
import { 
  Truck, 
  ArrowLeft, 
  Printer, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Droplets,
  Filter
} from 'lucide-react'

export default function TruckDetail() {
  const { id } = useParams()
  const { company } = useAuth()
  const navigate = useNavigate()
  const [truck, setTruck] = useState(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const qrCodeRef = useRef()
  
  useEffect(() => {
    const fetchTruckDetails = async () => {
      if (!company || !id) return
      
      try {
        // Fetch truck details
        const { data: truckData, error: truckError } = await supabase
          .from('trucks')
          .select('*')
          .eq('id', id)
          .eq('company_id', company.id)
          .single()
        
        if (truckError) throw truckError
        
        setTruck(truckData)
        
        // Fetch maintenance records
        const { data: maintenanceData, error: maintenanceError } = await supabase
          .from('maintenance_records')
          .select(`
            id, 
            truck_id,
            maintenance_type,
            performed_at,
            mileage,
            next_due_mileage,
            trucks(vin, year, make, model)
          `)
          .eq('truck_id', id)
          .order('performed_at', { ascending: false })
        
        if (maintenanceError) throw maintenanceError
        
        setMaintenanceRecords(maintenanceData || [])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching truck details:', error)
        setError('Failed to load truck details.')
        setLoading(false)
      }
    }
    
    fetchTruckDetails()
  }, [id, company])
  
  const handlePrintQRCode = useReactToPrint({
    content: () => qrCodeRef.current,
  })
  
  const handleDeleteTruck = async () => {
    if (!company || !id) return
    
    try {
      setError('')
      
      // Delete truck
      const { error } = await supabase
        .from('trucks')
        .delete()
        .eq('id', id)
        .eq('company_id', company.id)
      
      if (error) throw error
      
      navigate('/trucks')
    } catch (error) {
      console.error('Error deleting truck:', error)
      setError('Failed to delete truck. Please try again.')
      setDeleteModalOpen(false)
    }
  }
  
  const getMaintenanceStatus = (type) => {
    const record = maintenanceRecords.find(r => r.maintenance_type === type)
    
    if (!record) {
      return {
        status: 'unknown',
        label: 'No records',
        color: 'gray'
      }
    }
    
    if (truck.current_mileage >= record.next_due_mileage) {
      return {
        status: 'due',
        label: 'Maintenance Due',
        color: 'red'
      }
    }
    
    const milesRemaining = record.next_due_mileage - truck.current_mileage
    
    if (milesRemaining < 1000) {
      return {
        status: 'soon',
        label: 'Due Soon',
        color: 'yellow'
      }
    }
    
    return {
      status: 'good',
      label: 'Good',
      color: 'green'
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!truck) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Truck not found</h2>
        <p className="mt-2 text-gray-500">The truck you're looking for doesn't exist or you don't have permission to view it.</p>
        <div className="mt-6">
          <Link to="/trucks" className="btn btn-primary">
            Back to Trucks
          </Link>
        </div>
      </div>
    )
  }
  
  const oilStatus = getMaintenanceStatus('Oil Change')
  const airFilterStatus = getMaintenanceStatus('Air Filter Change')
  const fuelFilterStatus = getMaintenanceStatus('Fuel Filter Change')
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {truck.year} {truck.make} {truck.model}
          </h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePrintQRCode}
            className="btn btn-outline flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print QR
          </button>
          <Link
            to={`/trucks/${id}/maintenance`}
            className="btn btn-primary flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Update Maintenance
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Truck Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Truck className="h-5 w-5 mr-2 text-primary-600" />
                Truck Information
              </h3>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">VIN</dt>
                  <dd className="mt-1 text-sm text-gray-900">{truck.vin}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">License Plate</dt>
                  <dd className="mt-1 text-sm text-gray-900">{truck.license_plate}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Year</dt>
                  <dd className="mt-1 text-sm text-gray-900">{truck.year}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Make</dt>
                  <dd className="mt-1 text-sm text-gray-900">{truck.make}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Model</dt>
                  <dd className="mt-1 text-sm text-gray-900">{truck.model}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Current Mileage</dt>
                  <dd className="mt-1 text-sm text-gray-900">{truck.current_mileage.toLocaleString()} miles</dd>
                </div>
                {truck.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{truck.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          {/* Maintenance Status */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary-600" />
                Maintenance Status
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Droplets className="h-4 w-4 mr-2" />
                    Oil Change
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      {oilStatus.status === 'due' && (
                        <AlertTriangle className={`h-5 w-5 mr-2 text-red-500`} />
                      )}
                      {oilStatus.status === 'soon' && (
                        <AlertTriangle className={`h-5 w-5 mr-2 text-yellow-500`} />
                      )}
                      {oilStatus.status === 'good' && (
                        <CheckCircle className={`h-5 w-5 mr-2 text-green-500`} />
                      )}
                      <span className={`font-medium text-${oilStatus.color}-700`}>
                        {oilStatus.label}
                      </span>
                      
                      {maintenanceRecords.find(r => r.maintenance_type === 'Oil Change') && (
                        <div className="ml-4 text-gray-500">
                          {maintenanceRecords.find(r => r.maintenance_type === 'Oil Change').next_due_mileage && (
                            <span>
                              Next due: {maintenanceRecords.find(r => r.maintenance_type === 'Oil Change').next_due_mileage.toLocaleString()} miles
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Air Filter
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      {airFilterStatus.status === 'due' && (
                        <AlertTriangle className={`h-5 w-5 mr-2 text-red-500`} />
                      )}
                      {airFilterStatus.status === 'soon' && (
                        <AlertTriangle className={`h-5 w-5 mr-2 text-yellow-500`} />
                      )}
                      {airFilterStatus.status === 'good' && (
                        <CheckCircle className={`h-5 w-5 mr-2 text-green-500`} />
                      )}
                      <span className={`font-medium text-${airFilterStatus.color}-700`}>
                        {airFilterStatus.label}
                      </span>
                      
                      {maintenanceRecords.find(r => r.maintenance_type === 'Air Filter Change') && (
                        <div className="ml-4 text-gray-500">
                          {maintenanceRecords.find(r => r.maintenance_type === 'Air Filter Change').next_due_mileage && (
                            <span>
                              Next due: {maintenanceRecords.find(r => r.maintenance_type === 'Air Filter Change').next_due_mileage.toLocaleString()} miles
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Fuel Filter
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      {fuelFilterStatus.status === 'due' && (
                        <AlertTriangle className={`h-5 w-5 mr-2 text-red-500`} />
                      )}
                      {fuelFilterStatus.status === 'soon' && (
                        <AlertTriangle className={`h-5 w-5 mr-2 text-yellow-500`} />
                      )}
                      {fuelFilterStatus.status === 'good' && (
                        <CheckCircle className={`h-5 w-5 mr-2 text-green-500`} />
                      )}
                      <span className={`font-medium text-${fuelFilterStatus.color}-700`}>
                        {fuelFilterStatus.label}
                      </span>
                      
                      {maintenanceRecords.find(r => r.maintenance_type === 'Fuel Filter Change') && (
                        <div className="ml-4 text-gray-500">
                          {maintenanceRecords.find(r => r.maintenance_type === 'Fuel Filter Change').next_due_mileage && (
                            <span>
                              Next due: {maintenanceRecords.find(r => r.maintenance_type === 'Fuel Filter Change').next_due_mileage.toLocaleString()} miles
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Maintenance History */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                Maintenance History
              </h3>
              <Link
                to={`/trucks/${id}/maintenance`}
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Add Record
              </Link>
            </div>
            <div className="border-t border-gray-200">
              {maintenanceRecords.length > 0 ? (
                <div className="overflow-hidden overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mileage
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Part Info
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Next Due
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {maintenanceRecords.map((record) => (
                        <tr key={record.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(parseISO(record.performed_at), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.maintenance_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.mileage.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.part_make_model || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.next_due_mileage ? record.next_due_mileage.toLocaleString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No maintenance records found.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* QR Code */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center justify-center">
                Truck QR Code
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 text-center">
                Scan to access maintenance records
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div ref={qrCodeRef} className="flex flex-col items-center p-4">
                <QRCode 
                  value={`${window.location.origin}/trucks/${id}`}
                  size={200}
                  level="H"
                />
                <div className="mt-4 text-center">
                  <p className="font-bold">{truck.year} {truck.make} {truck.model}</p>
                  <p className="text-sm text-gray-500">VIN: {truck.vin}</p>
                  <p className="text-sm text-gray-500">License: {truck.license_plate}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handlePrintQRCode}
                  className="btn btn-primary flex items-center"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Truck
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this truck? All maintenance records associated with this truck will also be deleted. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteTruck}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
