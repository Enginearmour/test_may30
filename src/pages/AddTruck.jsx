import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Truck, ArrowLeft } from 'lucide-react'

const TruckSchema = Yup.object().shape({
  vin: Yup.string()
    .required('VIN is required')
    .min(17, 'VIN must be 17 characters')
    .max(17, 'VIN must be 17 characters'),
  year: Yup.number()
    .required('Year is required')
    .min(1900, 'Year must be at least 1900')
    .max(new Date().getFullYear() + 1, `Year cannot be greater than ${new Date().getFullYear() + 1}`),
  make: Yup.string()
    .required('Make is required'),
  model: Yup.string()
    .required('Model is required'),
  current_mileage: Yup.number()
    .required('Current mileage is required')
    .min(0, 'Mileage cannot be negative'),
  license_plate: Yup.string()
    .required('License plate is required'),
  notes: Yup.string()
})

export default function AddTruck() {
  const { company } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  
  const initialValues = {
    vin: '',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    current_mileage: 0,
    license_plate: '',
    notes: ''
  }
  
  const handleSubmit = async (values, { setSubmitting }) => {
    if (!company) return
    
    try {
      setError('')
      
      // Add truck to database
      const { data, error } = await supabase
        .from('trucks')
        .insert([
          { 
            ...values,
            company_id: company.id 
          }
        ])
        .select()
      
      if (error) throw error
      
      // Redirect to truck detail page
      navigate(`/trucks/${data[0].id}`)
    } catch (error) {
      console.error('Error adding truck:', error)
      setError('Failed to add truck. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
        <h1 className="text-2xl font-semibold text-gray-900">Add New Truck</h1>
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
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={TruckSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="vin" className="block text-sm font-medium text-gray-700">
                      VIN
                    </label>
                    <div className="mt-1">
                      <Field
                        type="text"
                        name="vin"
                        id="vin"
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.vin && touched.vin ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage name="vin" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700">
                      License Plate
                    </label>
                    <div className="mt-1">
                      <Field
                        type="text"
                        name="license_plate"
                        id="license_plate"
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.license_plate && touched.license_plate ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage name="license_plate" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                      Year
                    </label>
                    <div className="mt-1">
                      <Field
                        type="number"
                        name="year"
                        id="year"
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.year && touched.year ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage name="year" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                      Make
                    </label>
                    <div className="mt-1">
                      <Field
                        type="text"
                        name="make"
                        id="make"
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.make && touched.make ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage name="make" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <div className="mt-1">
                      <Field
                        type="text"
                        name="model"
                        id="model"
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.model && touched.model ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage name="model" component="div" className="mt-1 text-sm text-red-600" />
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
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <div className="mt-1">
                      <Field
                        as="textarea"
                        name="notes"
                        id="notes"
                        rows={3}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <ErrorMessage name="notes" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Add any additional information about this truck.
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
                    {isSubmitting ? 'Saving...' : 'Save Truck'}
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
