import React, { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const DocumentDetail = () => {
    const { id } = useParams()
    const location = useLocation()
    const [document, setDocument] = useState(null)
    const [risks, setRisks] = useState([])
    const [loading, setLoading] = useState(true)
    const [pollingInterval, setPollingInterval] = useState(null)
    const { token } = useSelector((state) => state.auth)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

    // Check if we just came from upload
    const justUploaded = location.state?.justUploaded || false

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval)
            }
        }
    }, [pollingInterval])

    // Initial fetch
    useEffect(() => {
        fetchDocumentDetails()
    }, [id])

    // Start polling if document is processing
    useEffect(() => {
        if (document?.status === 'PROCESSING' || justUploaded) {
            console.log('🔄 Starting polling for document:', id)
            const interval = setInterval(() => {
                fetchDocumentDetails()
            }, 3000) // Poll every 3 seconds
            setPollingInterval(interval)
        } else {
            // Stop polling if document is completed or failed
            if (pollingInterval) {
                console.log('⏹️ Stopping polling - document status:', document?.status)
                clearInterval(pollingInterval)
                setPollingInterval(null)
            }
        }
    }, [document?.status, justUploaded])

    const fetchDocumentDetails = async () => {
        try {
            console.log('📡 Fetching document details for:', id)
            const response = await axios.get(`${API_URL}/documents/${id}/`, {
                headers: { Authorization: `Token ${token}` }
            })
            setDocument(response.data)
            console.log('📄 Document status:', response.data.status)

            // If document is completed, fetch risks
            if (response.data.status === 'COMPLETED') {
                console.log('✅ Document completed, fetching risks...')
                const risksResponse = await axios.get(`${API_URL}/analyze/documents/${id}/risks/`, {
                    headers: { Authorization: `Token ${token}` }
                })
                setRisks(risksResponse.data)
                console.log(`📊 Found ${risksResponse.data.length} risks`)
                setLoading(false)
            }
            // If failed, stop loading
            else if (response.data.status === 'FAILED') {
                console.log('❌ Document processing failed')
                setLoading(false)
            }
            // If still processing, keep loading true
            else {
                setLoading(true)
            }
        } catch (error) {
            console.error('Error fetching document:', error)
            setLoading(false)
        }
    }

    const getRiskLevelColor = (level) => {
        switch (level) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
            case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getRiskCategoryColor = (category) => {
        switch (category) {
            case 'FINANCIAL': return 'bg-blue-100 text-blue-800'
            case 'PRIVACY': return 'bg-purple-100 text-purple-800'
            case 'LEGAL': return 'bg-indigo-100 text-indigo-800'
            case 'SUBSCRIPTION': return 'bg-pink-100 text-pink-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Show loading for both initial load and processing state
    if (loading || document?.status === 'PROCESSING') {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        {document?.status === 'PROCESSING'
                            ? 'AI is analyzing your document for risks...'
                            : 'Loading document details...'}
                    </p>
                    {document?.status === 'PROCESSING' && (
                        <p className="text-sm text-gray-500 mt-2">
                            This may take a few moments. Page will auto-refresh when complete.
                        </p>
                    )}
                </div>
            </div>
        )
    }

    if (!document) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Document not found</p>
                <Link to="/documents" className="btn-primary mt-4 inline-block">
                    Back to Documents
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link to="/documents" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeftIcon className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
                    <p className="text-gray-600">
                        Uploaded on {new Date(document.uploaded_at).toLocaleDateString()}
                    </p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${document.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        document.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {document.status}
                </span>
            </div>

            {/* Processing State - Kept for any edge cases */}
            {document.status === 'PROCESSING' && (
                <div className="card text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Processing Document</h3>
                    <p className="mt-2 text-gray-600">
                        Our AI is analyzing your document for risks. This may take a few minutes.
                    </p>
                </div>
            )}

            {/* Risk Analysis Results */}
            {document.status === 'COMPLETED' && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                            <p className="text-sm text-red-600 font-medium">Critical Risks</p>
                            <p className="text-3xl font-bold text-red-700">
                                {risks.filter(r => r.risk_level === 'CRITICAL').length}
                            </p>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                            <p className="text-sm text-orange-600 font-medium">High Risks</p>
                            <p className="text-3xl font-bold text-orange-700">
                                {risks.filter(r => r.risk_level === 'HIGH').length}
                            </p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                            <p className="text-sm text-yellow-600 font-medium">Medium Risks</p>
                            <p className="text-3xl font-bold text-yellow-700">
                                {risks.filter(r => r.risk_level === 'MEDIUM').length}
                            </p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                            <p className="text-sm text-green-600 font-medium">Low Risks</p>
                            <p className="text-3xl font-bold text-green-700">
                                {risks.filter(r => r.risk_level === 'LOW').length}
                            </p>
                        </div>
                    </div>

                    {/* Risk Clauses */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detected Risk Clauses</h2>
                        {risks.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No risks detected in this document</p>
                        ) : (
                            <div className="space-y-4">
                                {risks.map((risk) => (
                                    <div key={risk.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(risk.risk_level)}`}>
                                                    {risk.risk_level}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskCategoryColor(risk.category)}`}>
                                                    {risk.category_display}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">Page {risk.page_number}</span>
                                        </div>
                                        <p className="text-gray-700 text-sm mb-2">"{risk.clause_text}"</p>
                                        <p className="text-xs text-gray-500">{risk.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default DocumentDetail