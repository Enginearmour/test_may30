import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Users, Building, Phone, Mail, MapPin } from 'lucide-react'

const CompanySchema = Yup.object().shape({
  name: Yup.string()
    .required('Company name is required'),
  address: Yup.string()
    .required('Address is required'),
  phone: Yup.string()
    .required('Phone number is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  website: Yup.string()
    .url('Invalid URL format'),
  description: Yup.string()
})

export default function CompanyProfile() {
  const { company, updateCompany, user } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const initialValues = {
    name: company?.name || '',
    address: company?.address || '',
    phone: company?.phone || '',
    email: company?.email || user?.email || '',
    website: company?.website || '',
    description: company?.description || ''
  }
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('')
      setSuccess('')
      
      await updateCompany(values)
      
      setSuccess('Company profile updated successfully.')
    } catch (error) {
      console.error('Error updating company profile:', error)
      setError('Failed to update company profile. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
        <Building className="h-6 w-6 mr-2 text-primary-600" />
        Company Profile
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
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary-600" />
            Company Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Update your company details
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <Formik
            initialValues={initialValues}
            validationSchema={CompanySchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <Field
                        type="text"
                        name="name"
                        id="name"
                        className={`pl-10 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.name && touched.name ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <Field
                        type="text"
                        name="phone"
                        id="phone"
                        className={`pl-10 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.phone && touched.phone ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        className={`pl-10 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.email && touched.email ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <div className="mt-1">
                      <Field
                        type="text"
                        name="website"
                        id="website"
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.website && touched.website ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage name="website" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <Field
                        type="text"
                        name="address"
                        id="address"
                        className={`pl-10 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.address && touched.address ? 'border-red-300' : ''
                        }`}
                      />
                      <ErrorMessage name="address" component="div" className="mt-1 text-sm text-red-600" />
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
                      Brief description of your company.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
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
