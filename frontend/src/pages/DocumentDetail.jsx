import React, { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import {
    ArrowLeftIcon,
    DocumentArrowDownIcon,
    TagIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { exportToPDF, exportToExcel, exportToCSV, exportToJSON } from '../services/exportService';
import ExportDropdown from '../components/ExportDropdown';  // ✅ ADD THIS LINE!
import toast from 'react-hot-toast';  // ✅ Also add this for toast notifications


// Fix PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const DocumentDetail = () => {
    const { id } = useParams()
    const location = useLocation()
    const [document, setDocument] = useState(null)
    const [risks, setRisks] = useState([])
    const [loading, setLoading] = useState(true)
    const [pollingInterval, setPollingInterval] = useState(null)
    const [numPages, setNumPages] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [tags, setTags] = useState([])
    const [newTag, setNewTag] = useState('')
    const { token } = useSelector((state) => state.auth)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

    const justUploaded = location.state?.justUploaded || false

    useEffect(() => {
        return () => {
            if (pollingInterval) clearInterval(pollingInterval)
        }
    }, [pollingInterval])

    useEffect(() => {
        fetchDocumentDetails()
    }, [id])

    useEffect(() => {
        if (document?.status === 'PROCESSING' || justUploaded) {
            const interval = setInterval(fetchDocumentDetails, 3000)
            setPollingInterval(interval)
        } else if (pollingInterval) {
            clearInterval(pollingInterval)
            setPollingInterval(null)
        }
    }, [document?.status, justUploaded])

    const fetchDocumentDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/documents/${id}/`, {
                headers: { Authorization: `Token ${token}` }
            })
            setDocument(response.data)

            if (response.data.status === 'COMPLETED') {
                const risksResponse = await axios.get(`${API_URL}/analyze/documents/${id}/risks/`, {
                    headers: { Authorization: `Token ${token}` }
                })
                setRisks(risksResponse.data)
                setLoading(false)
            } else if (response.data.status === 'FAILED') {
                setLoading(false)
            } else {
                setLoading(true)
            }
        } catch (error) {
            console.error('Error fetching document:', error)
            setLoading(false)
        }
    }

    const addTag = () => {
        if (newTag.trim()) {
            setTags([...tags, { id: Date.now(), name: newTag }])
            setNewTag('')
        }
    }

    const removeTag = (tagId) => {
        setTags(tags.filter(t => t.id !== tagId))
    }

    const handleExport = async (format) => {
        try {
            switch (format) {
                case 'pdf':
                    await exportToPDF(document, risks);
                    toast.success('PDF exported successfully!');
                    break;
                case 'excel':
                    exportToExcel([document], risks);
                    toast.success('Excel exported successfully!');
                    break;
                case 'csv':
                    exportToCSV(risks, `${document.title}_risks`);
                    toast.success('CSV exported successfully!');
                    break;
                case 'json':
                    exportToJSON({ document, risks }, `${document.title}_data`);
                    toast.success('JSON exported successfully!');
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Export failed. Please try again.');
        }
    };

    const getRiskLevelColor = (level) => ({
        bg: level === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30' :
            level === 'HIGH' ? 'bg-orange-100 dark:bg-orange-900/30' :
                level === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    'bg-green-100 dark:bg-green-900/30',
        text: level === 'CRITICAL' ? 'text-red-800 dark:text-red-400' :
            level === 'HIGH' ? 'text-orange-800 dark:text-orange-400' :
                level === 'MEDIUM' ? 'text-yellow-800 dark:text-yellow-400' :
                    'text-green-800 dark:text-green-400',
    })

    const getRiskCategoryColor = (category) => ({
        bg: category === 'FINANCIAL' ? 'bg-blue-100 dark:bg-blue-900/30' :
            category === 'PRIVACY' ? 'bg-purple-100 dark:bg-purple-900/30' :
                category === 'LEGAL' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                    'bg-pink-100 dark:bg-pink-900/30',
        text: category === 'FINANCIAL' ? 'text-blue-800 dark:text-blue-400' :
            category === 'PRIVACY' ? 'text-purple-800 dark:text-purple-400' :
                category === 'LEGAL' ? 'text-indigo-800 dark:text-indigo-400' :
                    'text-pink-800 dark:text-pink-400',
    })

    if (loading || document?.status === 'PROCESSING') {
        return (
            <div className="flex items-center justify-center h-64 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        {document?.status === 'PROCESSING'
                            ? 'AI is analyzing your document for risks...'
                            : 'Loading document details...'}
                    </p>
                </div>
            </div>
        )
    }

    if (!document) {
        return (
            <div className="text-center py-12 dark:bg-gray-900">
                <p className="text-gray-500 dark:text-gray-400">Document not found</p>
                <Link to="/documents" className="btn-primary mt-4 inline-block">
                    Back to Documents
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to="/documents" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{document.title}</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Uploaded on {new Date(document.uploaded_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <ExportDropdown onExport={handleExport} />
            </div>

            {/* Tags Section */}
            <div className="card dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                    <TagIcon className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map(tag => (
                        <span
                            key={tag.id}
                            className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 rounded-full text-sm flex items-center"
                        >
                            {tag.name}
                            <button
                                onClick={() => removeTag(tag.id)}
                                className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        placeholder="Add a tag..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                        onClick={addTag}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Risk Analysis Results */}
            {document.status === 'COMPLETED' && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => {
                            const count = risks.filter(r => r.risk_level === level).length
                            const colors = getRiskLevelColor(level)
                            return (
                                <div key={level} className={`${colors.bg} rounded-xl p-6`}>
                                    <p className={`text-sm font-medium ${colors.text}`}>{level} Risks</p>
                                    <p className={`text-3xl font-bold ${colors.text}`}>{count}</p>
                                </div>
                            )
                        })}
                    </div>

                    {/* Risk Clauses with PDF Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Risk List */}
                        <div className="lg:col-span-2 card dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-center space-x-2 mb-6">
                                <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detected Risk Clauses</h2>
                            </div>
                            {risks.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No risks detected in this document</p>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                    {risks.map((risk) => {
                                        const levelColors = getRiskLevelColor(risk.risk_level)
                                        const categoryColors = getRiskCategoryColor(risk.category)
                                        return (
                                            <div key={risk.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex gap-2">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${levelColors.bg} ${levelColors.text}`}>
                                                            {risk.risk_level}
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryColors.bg} ${categoryColors.text}`}>
                                                            {risk.category_display}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Page {risk.page_number}</span>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">"{risk.clause_text}"</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{risk.explanation}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* PDF Preview */}
                        <div className="card dark:bg-gray-800 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Document Preview</h3>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                {document.file?.toLowerCase().endsWith('.pdf') ? (
                                    <Document
                                        file={`${API_URL}${document.file}`}
                                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                        className="flex flex-col items-center"
                                    >
                                        <Page pageNumber={pageNumber} width={300} />
                                    </Document>
                                ) : (
                                    <div className="text-center py-12">
                                        <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">Preview not available for this file type</p>
                                    </div>
                                )}
                                {numPages > 1 && (
                                    <div className="flex justify-center space-x-4 mt-4">
                                        <button
                                            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                                            disabled={pageNumber <= 1}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Page {pageNumber} of {numPages}
                                        </span>
                                        <button
                                            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                                            disabled={pageNumber >= numPages}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default DocumentDetail