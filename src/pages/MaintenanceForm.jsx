import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { ArrowLeft, Truck, Droplets, Filter } from 'lucide-react'

const MaintenanceSchema = Yup.object().shape({
  maintenance_type: Yup.string()
    .required('Maintenance type is required'),
  current_mileage: Yup.number()
    .required('Current mileage is required')
    .min(0, 'Mileage cannot be negative'),
  part_make_model: Yup.string(),
  description: Yup.string(),
  next_due_mileage: Yup.number()
    .min(0, 'Mileage cannot be negative')
})

export default function MaintenanceForm() {
  const { id } = useParams()
  const { company } = useAuth()
  const navigate = useNavigate()
  const [truck, setTruck] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  useEffect(() => {
    const fetchTruck = async () => {
      if (!company || !id) return
      
      try {
        const { data, error } = await supabase
          .from('trucks')
          .select('*')
          .eq('id', id)
          .eq('company_id', company.id)
          .single()
        
        if (error) throw error
        
        setTruck(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching truck:', error)
        setError('Failed to load truck details.')
        setLoading(false)
      }
    }
    
    fetchTruck()
  }, [id, company])
  
  const initialValues = {
    maintenance_type: 'Oil Change',
    current_mileage: truck?.current_mileage || 0,
    part_make_model: '',
    description: '',
    next_due_mileage: 0
  }
  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (!company || !id || !truck) return
    
    try {
      setError('')
      setSuccess('')
      
      // Calculate next due mileage if not provided
      let nextDueMileage = values.next_due_mileage
      
      if (!nextDueMileage) {
        // Default intervals based on maintenance type
        if (values.maintenance_type === 'Oil Change') {
          nextDueMileage = values.current_mileage + 15000
        } else if (values.maintenance_type === 'Air Filter Change') {
          nextDueMileage = values.current_mileage + 30000
        } else if (values.maintenance_type === 'Fuel Filter Change') {
          nextDueMileage = values.current_mileage + 30000
        }
      }
      
      // Add maintenance record
      const { error: maintenanceError } = await supabase
        .from('maintenance_records')
        .insert([
          { 
            truck_id: id,
            company_id: company.id,
            maintenance_type: values.maintenance_type,
            performed_at: new Date().toISOString(),
            mileage: values.current_mileage,
            part_make_model: values.part_make_model,
            description: values.description,
            next_due_mileage: nextDueMileage
          }
        ])
      
      if (maintenanceError) throw maintenanceError
      
      // Update truck mileage if current mileage is higher
      if (values.current_mileage > truck.current_mileage) {
        const { error: truckError } = await supabase
          .from('trucks')
          .update({ current_mileage: values.current_mileage })
          .eq('id', id)
        
        if (truckError) throw truckError
      }
      
      setSuccess('Maintenance record added successfully.')
      resetForm()
      
      // Set initial values again with updated mileage
      initialValues.current_mileage = values.current_mileage
    } catch (error) {
      console.error('Error adding maintenance record:', error)
      setError('Failed to add maintenance record. Please try again.')
    } finally {
      setSubmitting(false)
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
          <button
            onClick={() => navigate('/trucks')}
            className="btn btn-primary"
          >
            Back to Trucks
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Update Maintenance</h1>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {truck.year} {truck.make} {truck.model}
            </h3>
            <p className="text-sm text-gray-500">
              VIN: {truck.vin} | Current Mileage: {truck.current_mileage.toLocaleString()} miles
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          <Formik
            initialValues={initialValues}
            validationSchema={MaintenanceSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values, errors, touched }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="maintenance_type" className="block text-sm font-medium text-gray-700">
                      Maintenance Type
                    </label>
                    <div className="mt-1">
                      <Field
                        as="select"
                        name="maintenance_type"
                        id="maintenance_type"
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.maintenance_type && touched.maintenance_type ? 'border-red-300' : ''
                        }`}
                      >
                        <option value="Oil Change">Oil Change</option>
                        <option value="Air Filter Change">Air Filter Change</option>
                        <option value="Fuel Filter Change">Fuel Filter Change</option>
                        <option value="Tire Rotation">Tire Rotation</option>
                        <option value="Brake Service">Brake Service</option>
                        <option value="Other">Other</option>
                      </Field>
                      <ErrorMessage name="maintenance_type" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="current_mileage" className="block text-sm font-medium text-gray-700">
                      Current Mileage
                    </label>
                    <div className="mt-1">
                      <Field
                        type="number"
                        name="current_mileage"
                        id="current_mileage"
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.current_mileage && touched.current_mileage ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage name="current_mileage" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="part_make_model" className="block text-sm font-medium text-gray-700">
                      Part Make/Model
                    </label>
                    <div className="mt-1">
                      <Field
                        type="text"
                        name="part_make_model"
                        id="part_make_model"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <ErrorMessage name="part_make_model" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="next_due_mileage" className="block text-sm font-medium text-gray-700">
                      Next Due Mileage
                    </label>
                    <div className="mt-1">
                      <Field
                        type="number"
                        name="next_due_mileage"
                        id="next_due_mileage"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder={
                          values.maintenance_type === 'Oil Change' 
                            ? `${values.current_mileage + 15000}` 
                            : values.maintenance_type === 'Air Filter Change' || values.maintenance_type === 'Fuel Filter Change'
                              ? `${values.current_mileage + 30000}`
                              : ''
                        }
                      />
                      <ErrorMessage name="next_due_mileage" component="div" className="mt-1 text-sm text-red-600" />
                      <p className="mt-1 text-xs text-gray-500">
                        {values.maintenance_type === 'Oil Change' && 'Recommended: Every 15,000 miles'}
                        {values.maintenance_type === 'Air Filter Change' && 'Recommended: Every 30,000 miles'}
                        {values.maintenance_type === 'Fuel Filter Change' && 'Recommended: Every 30,000 miles'}
                        {!['Oil Change', 'Air Filter Change', 'Fuel Filter Change'].includes(values.maintenance_type) && 'Leave blank to skip scheduling'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <div className="mt-1">
                      <Field
                        as="textarea"
                        name="description"
                        id="description"
                        rows={3}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Add any additional details about the maintenance performed.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="btn btn-outline mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Maintenance Record'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}
