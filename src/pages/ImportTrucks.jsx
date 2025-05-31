import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import CSVReader from 'react-csv-reader'
import { ArrowLeft, Upload, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default function ImportTrucks() {
  const { company } = useAuth()
  const navigate = useNavigate()
  const [csvData, setCsvData] = useState(null)
  const [validationResults, setValidationResults] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState(null)
  const [error, setError] = useState('')
  
  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  }
  
  const handleCSVUpload = (data, fileInfo) => {
    setCsvData(data)
    validateCSVData(data)
  }
  
  const validateCSVData = (data) => {
    const requiredFields = ['vin', 'year', 'make', 'model', 'current_mileage', 'license_plate']
    const results = {
      valid: [],
      invalid: []
    }
    
    data.forEach((row, index) => {
      const missingFields = requiredFields.filter(field => !row[field])
      
      if (missingFields.length > 0) {
        results.invalid.push({
          row: index + 1,
          data: row,
          errors: [`Missing required fields: ${missingFields.join(', ')}`]
        })
        return
      }
      
      const errors = []
      
      // Validate VIN
      if (row.vin && (typeof row.vin !== 'string' || row.vin.length !== 17)) {
        errors.push('VIN must be 17 characters')
      }
      
      // Validate year
      if (row.year && (row.year < 1900 || row.year > new Date().getFullYear() + 1)) {
        errors.push(`Year must be between 1900 and ${new Date().getFullYear() + 1}`)
      }
      
      // Validate mileage
      if (row.current_mileage < 0) {
        errors.push('Mileage cannot be negative')
      }
      
      if (errors.length > 0) {
        results.invalid.push({
          row: index + 1,
          data: row,
          errors
        })
      } else {
        results.valid.push({
          row: index + 1,
          data: row
        })
      }
    })
    
    setValidationResults(results)
  }
  
  const handleImport = async () => {
    if (!company || !validationResults || validationResults.valid.length === 0) return
    
    try {
      setError('')
      setImporting(true)
      
      const trucksToImport = validationResults.valid.map(item => ({
        ...item.data,
        company_id: company.id
      }))
      
      const { data, error } = await supabase
        .from('trucks')
        .insert(trucksToImport)
        .select()
      
      if (error) throw error
      
      setImportResults({
        success: data.length,
        total: validationResults.valid.length
      })
    } catch (error) {
      console.error('Error importing trucks:', error)
      setError('Failed to import trucks. Please try again.')
    } finally {
      setImporting(false)
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
        <h1 className="text-2xl font-semibold text-gray-900">Import Trucks</h1>
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
          {!importResults ? (
            <>
              <div className="max-w-xl text-sm text-gray-500">
                <p>
                  Import multiple trucks by uploading a CSV file. The file should include the following columns:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>vin (required)</li>
                  <li>year (required)</li>
                  <li>make (required)</li>
                  <li>model (required)</li>
                  <li>current_mileage (required)</li>
                  <li>license_plate (required)</li>
                  <li>notes (optional)</li>
                </ul>
              </div>
              
              <div className="mt-5">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <p className="mt-1 text-sm text-gray-500">
                    Upload a CSV file with truck data
                  </p>
                  <div className="mt-4 w-full">
                    <CSVReader
                      cssClass="csv-reader-input"
                      onFileLoaded={handleCSVUpload}
                      parserOptions={papaparseOptions}
                      cssInputClass="hidden"
                      label={
                        <button className="btn btn-primary w-full">
                          Select CSV File
                        </button>
                      }
                    />
                  </div>
                </div>
              </div>
              
              {validationResults && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Validation Results</h3>
                    {validationResults.valid.length > 0 && (
                      <button
                        onClick={handleImport}
                        disabled={importing}
                        className="btn btn-primary"
                      >
                        {importing ? 'Importing...' : `Import ${validationResults.valid.length} Trucks`}
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          {validationResults.valid.length} valid trucks ready to import
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {validationResults.invalid.length > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            {validationResults.invalid.length} invalid trucks (will be skipped)
                          </p>
                          <div className="mt-2 max-h-40 overflow-y-auto">
                            <ul className="list-disc pl-5 space-y-1">
                              {validationResults.invalid.map((item, index) => (
                                <li key={index} className="text-sm text-yellow-700">
                                  Row {item.row}: {item.errors.join(', ')}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Import Successful</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>Successfully imported {importResults.success} out of {importResults.total} trucks.</p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/trucks')}
                  className="btn btn-primary"
                >
                  View All Trucks
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
