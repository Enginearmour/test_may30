import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Truck, BarChart2, QrCode, Users, Menu, X, LogOut } from 'lucide-react'

export default function Layout() {
  const { user, company, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error.message)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-primary-800 text-white">
          <div className="flex items-center justify-between h-16 px-4 border-b border-primary-700">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-primary-300" />
              <span className="ml-2 text-xl font-semibold">FleetMaintain</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive 
                    ? 'bg-primary-700 text-white' 
                    : 'text-primary-100 hover:bg-primary-700'
                }`
              }
              end
            >
              <BarChart2 className="mr-3 h-5 w-5" />
              Dashboard
            </NavLink>
            <NavLink 
              to="/trucks" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive 
                    ? 'bg-primary-700 text-white' 
                    : 'text-primary-100 hover:bg-primary-700'
                }`
              }
            >
              <Truck className="mr-3 h-5 w-5" />
              Trucks
            </NavLink>
            <NavLink 
              to="/scan" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive 
                    ? 'bg-primary-700 text-white' 
                    : 'text-primary-100 hover:bg-primary-700'
                }`
              }
            >
              <QrCode className="mr-3 h-5 w-5" />
              Scan QR
            </NavLink>
            <NavLink 
              to="/company" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive 
                    ? 'bg-primary-700 text-white' 
                    : 'text-primary-100 hover:bg-primary-700'
                }`
              }
            >
              <Users className="mr-3 h-5 w-5" />
              Company
            </NavLink>
          </nav>
          <div className="p-4 border-t border-primary-700">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-primary-100 rounded-md hover:bg-primary-700"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-primary-800 text-white">
          <div className="flex items-center h-16 px-4 border-b border-primary-700">
            <Truck className="h-8 w-8 text-primary-300" />
            <span className="ml-2 text-xl font-semibold">FleetMaintain</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive 
                    ? 'bg-primary-700 text-white' 
                    : 'text-primary-100 hover:bg-primary-700'
                }`
              }
              end
            >
              <BarChart2 className="mr-3 h-5 w-5" />
              Dashboard
            </NavLink>
            <NavLink 
              to="/trucks" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive 
                    ? 'bg-primary-700 text-white' 
                    : 'text-primary-100 hover:bg-primary-700'
                }`
              }
            >
              <Truck className="mr-3 h-5 w-5" />
              Trucks
            </NavLink>
            <NavLink 
              to="/scan" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive 
                    ? 'bg-primary-700 text-white' 
                    : 'text-primary-100 hover:bg-primary-700'
                }`
              }
            >
              <QrCode className="mr-3 h-5 w-5" />
              Scan QR
            </NavLink>
            <NavLink 
              to="/company" 
              className={({ isActive }) => 
                `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive 
                    ? 'bg-primary-700 text-white' 
                    : 'text-primary-100 hover:bg-primary-700'
                }`
              }
            >
              <Users className="mr-3 h-5 w-5" />
              Company
            </NavLink>
          </nav>
          <div className="p-4 border-t border-primary-700">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-primary-100 rounded-md hover:bg-primary-700"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white shadow">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button 
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              {company && (
                <span className="text-sm font-medium text-gray-700">
                  {company.name}
                </span>
              )}
              <div className="ml-4 flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} FleetMaintain. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  )
}
