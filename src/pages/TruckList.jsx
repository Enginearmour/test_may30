import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Truck, Plus, Upload, Search, AlertTriangle } from 'lucide-react'

export default function TruckList() {
  const { company } = useAuth()
  const [trucks, setTrucks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [maintenanceStatus, setMaintenanceStatus] = useState({})
  
  useEffect(() => {
    const fetchTrucks = async () => {
      if (!company) return
      
      try {
        const { data, error } = await supabase
          .from('trucks')
          .select('*')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setTrucks(data || [])
        
        // Fetch maintenance records to determine status
        const { data: maintenance, error: maintenanceError } = await supabase
          .from('maintenance_records')
          .select('truck_id, maintenance_type, next_due_mileage')
          .eq('company_id', company.id)
        
        if (maintenanceError) throw maintenanceError
        
        // Determine which trucks need maintenance
        const status = {}
        
        data.forEach(truck => {
          const truckMaintenance = maintenance.filter(m => m.truck_id === truck.id)
          
          // Check if any maintenance is due based on mileage
          const needsMaintenance = truckMaintenance.some(m => 
            m.next_due_mileage && truck.current_mileage >= m.next_due_mileage
          )
          
          status[truck.id] = needsMaintenance
        })
        
        setMaintenanceStatus(status)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching trucks:', error)
        setLoading(false)
      }
    }
    
    fetchTrucks()
  }, [company])
  
  const filteredTrucks = trucks.filter(truck => {
    const searchLower = searchTerm.toLowerCase()
    return (
      truck.vin.toLowerCase().includes(searchLower) ||
      truck.make.toLowerCase().includes(searchLower) ||
      truck.model.toLowerCase().includes(searchLower) ||
      truck.year.toString().includes(searchLower)
    )
  })
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h1 className="text-2xl font-semibold text-gray-900">Trucks</h1>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Link
            to="/trucks/import"
            className="btn btn-outline flex items-center justify-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Trucks
          </Link>
          <Link
            to="/trucks/add"
            className="btn btn-primary flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Truck
          </Link>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Search trucks by VIN, make, model, or year"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Truck List */}
      {filteredTrucks.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredTrucks.map((truck) => (
              <li key={truck.id}>
                <Link to={`/trucks/${truck.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <Truck className="h-6 w-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-primary-600">
                            {truck.year} {truck.make} {truck.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            VIN: {truck.vin}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {maintenanceStatus[truck.id] && (
                          <div className="mr-4 flex items-center text-yellow-600">
                            <AlertTriangle className="h-5 w-5 mr-1" />
                            <span className="text-sm">Maintenance Due</span>
                          </div>
                        )}
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {truck.current_mileage.toLocaleString()} miles
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <Truck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No trucks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {trucks.length === 0 
              ? "Get started by adding a new truck to your fleet."
              : "No trucks match your search criteria."}
          </p>
          {trucks.length === 0 && (
            <div className="mt-6">
              <Link
                to="/trucks/add"
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Truck
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
