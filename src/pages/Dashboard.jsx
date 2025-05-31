import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Truck, AlertTriangle, CheckCircle, Calendar, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function Dashboard() {
  const { company } = useAuth()
  const [stats, setStats] = useState({
    totalTrucks: 0,
    trucksNeedingMaintenance: 0,
    recentMaintenanceCount: 0
  })
  const [recentMaintenance, setRecentMaintenance] = useState([])
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!company) return
      
      try {
        // Get total trucks
        const { data: trucks, error: trucksError } = await supabase
          .from('trucks')
          .select('id, vin, year, make, model, current_mileage')
          .eq('company_id', company.id)
        
        if (trucksError) throw trucksError
        
        // Get maintenance records
        const { data: maintenance, error: maintenanceError } = await supabase
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
          .eq('company_id', company.id)
          .order('performed_at', { ascending: false })
        
        if (maintenanceError) throw maintenanceError
        
        // Calculate trucks needing maintenance
        const needMaintenance = trucks.filter(truck => {
          const truckMaintenance = maintenance.filter(m => m.truck_id === truck.id)
          
          // Check if any maintenance is due based on mileage
          return truckMaintenance.some(m => 
            m.next_due_mileage && truck.current_mileage >= m.next_due_mileage
          )
        })
        
        // Get recent maintenance (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        const recent = maintenance.filter(m => 
          new Date(m.performed_at) >= sevenDaysAgo
        ).slice(0, 5)
        
        // Get upcoming maintenance
        const upcoming = trucks.flatMap(truck => {
          const truckMaintenance = maintenance.filter(m => m.truck_id === truck.id)
          
          return truckMaintenance
            .filter(m => m.next_due_mileage && truck.current_mileage < m.next_due_mileage)
            .map(m => ({
              ...m,
              milesRemaining: m.next_due_mileage - truck.current_mileage,
              truck
            }))
        })
        .sort((a, b) => a.milesRemaining - b.milesRemaining)
        .slice(0, 5)
        
        setStats({
          totalTrucks: trucks.length,
          trucksNeedingMaintenance: needMaintenance.length,
          recentMaintenanceCount: recent.length
        })
        
        setRecentMaintenance(recent)
        setUpcomingMaintenance(upcoming)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [company])
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Link
          to="/trucks/add"
          className="btn btn-primary"
        >
          Add New Truck
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Truck className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Trucks
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.totalTrucks}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/trucks" className="font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Trucks Needing Maintenance
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.trucksNeedingMaintenance}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/trucks" className="font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Recent Maintenance
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.recentMaintenanceCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-gray-500">
                Last 7 days
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Maintenance */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-600" />
            Recent Maintenance
          </h3>
        </div>
        <div className="overflow-hidden">
          {recentMaintenance.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentMaintenance.map((record) => (
                <li key={record.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Truck className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.trucks.year} {record.trucks.make} {record.trucks.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          VIN: {record.trucks.vin}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm font-medium text-gray-900">
                        {record.maintenance_type}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(parseISO(record.performed_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
              No recent maintenance records found.
            </div>
          )}
        </div>
      </div>
      
      {/* Upcoming Maintenance */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary-600" />
            Upcoming Maintenance
          </h3>
        </div>
        <div className="overflow-hidden">
          {upcomingMaintenance.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {upcomingMaintenance.map((record) => (
                <li key={record.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Truck className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.trucks.year} {record.trucks.make} {record.trucks.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.maintenance_type} due in {record.milesRemaining} miles
                        </div>
                      </div>
                    </div>
                    <div>
                      <Link
                        to={`/trucks/${record.truck_id}/maintenance`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Update
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
              No upcoming maintenance records found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
