import React, { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
    ArrowLeftIcon,
    DocumentArrowDownIcon,
    TagIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    ShareIcon,
    PrinterIcon,
    StarIcon,
    BookmarkIcon,
    ChatBubbleLeftIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { exportToPDF, exportToExcel, exportToCSV, exportToJSON } from '../services/exportService';
import ExportDropdown from '../components/ExportDropdown';
import toast from 'react-hot-toast';

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
    const [isFavorite, setIsFavorite] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
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
            toast.success('Tag added!')
        }
    }

    const removeTag = (tagId) => {
        setTags(tags.filter(t => t.id !== tagId))
        toast.success('Tag removed!')
    }

    const addComment = () => {
        if (newComment.trim()) {
            setComments([...comments, {
                id: Date.now(),
                text: newComment,
                user: 'You',
                date: new Date().toISOString()
            }])
            setNewComment('')
            toast.success('Comment added!')
        }
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
        bg: level === 'CRITICAL' ? 'bg-gradient-to-r from-red-500 to-red-600' :
            level === 'HIGH' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                level === 'MEDIUM' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                    'bg-gradient-to-r from-green-500 to-green-600',
        text: 'text-white',
    })

    const getRiskCategoryColor = (category) => ({
        bg: category === 'FINANCIAL' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
            category === 'PRIVACY' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                category === 'LEGAL' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
                    'bg-gradient-to-r from-pink-500 to-pink-600',
        text: 'text-white'
    })

    if (loading || document?.status === 'PROCESSING') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
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
            <div className="text-center py-12">
                <DocumentTextIcon className="w-20 h-20 mx-auto text-gray-400" />
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Document not found</p>
                <Link to="/documents" className="btn-primary mt-6 inline-block">
                    Back to Documents
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6 min-h-screen">
            {/* Header with fixed positioning context */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-xl mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link to="/documents">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{document.title}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Uploaded on {new Date(document.uploaded_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsFavorite(!isFavorite)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <StarIcon className={`w-5 h-5 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                        </button>
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400" />
                        </button>
                        <button
                            onClick={() => toast.success('Share link copied!')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ShareIcon className="w-5 h-5 text-gray-400" />
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <PrinterIcon className="w-5 h-5 text-gray-400" />
                        </button>
                        <ExportDropdown onExport={handleExport} />
                    </div>
                </div>
            </div>

            {/* Comments Section - Collapsible */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="card dark:bg-gray-800 dark:border-gray-700 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comments</h3>

                            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {comment.user[0]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                                <p className="text-sm text-gray-900 dark:text-white">{comment.text}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {new Date(comment.date).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                                    placeholder="Add a comment..."
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                <button
                                    onClick={addComment}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex-shrink-0"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tags Section */}
            <div className="card dark:bg-gray-800 dark:border-gray-700 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                    <TagIcon className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map(tag => (
                        <span
                            key={tag.id}
                            className="px-3 py-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full text-sm flex items-center shadow-lg"
                        >
                            {tag.name}
                            <button
                                onClick={() => removeTag(tag.id)}
                                className="ml-2 hover:text-white/80 transition-colors"
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
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex-shrink-0"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Risk Analysis Results */}
            {document.status === 'COMPLETED' && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level, index) => {
                            const count = risks.filter(r => r.risk_level === level).length
                            const colors = getRiskLevelColor(level)
                            return (
                                <div
                                    key={level}
                                    className={`${colors.bg} rounded-2xl p-6 shadow-xl relative overflow-hidden`}
                                >
                                    <p className={`text-sm font-medium ${colors.text} opacity-90`}>{level} Risks</p>
                                    <p className={`text-4xl font-bold ${colors.text} mt-2`}>{count}</p>
                                </div>
                            )
                        })}
                    </div>

                    {/* Risk Clauses with PDF Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Risk List - Scrollable */}
                        <div className="lg:col-span-2 card dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-center space-x-2 mb-6 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10">
                                <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detected Risk Clauses</h2>
                                <span className="ml-auto px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium">
                                    {risks.length} total
                                </span>
                            </div>

                            {risks.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShieldCheckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">No risks detected in this document</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {risks.map((risk) => {
                                        const levelColors = getRiskLevelColor(risk.risk_level)
                                        const categoryColors = getRiskCategoryColor(risk.category)
                                        return (
                                            <div
                                                key={risk.id}
                                                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800/50"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex gap-2 flex-wrap">
                                                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${levelColors.bg} ${levelColors.text} shadow-lg`}>
                                                            {risk.risk_level}
                                                        </span>
                                                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${categoryColors.bg} ${categoryColors.text} shadow-lg`}>
                                                            {risk.category_display}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full flex-shrink-0">
                                                        Page {risk.page_number}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 leading-relaxed">
                                                    "{risk.clause_text}"
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                    {risk.explanation}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* PDF Preview - Sticky */}
                        <div className="lg:col-span-1">
                            <div className="card dark:bg-gray-800 dark:border-gray-700 sticky top-24">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <DocumentTextIcon className="w-5 h-5 mr-2 text-primary-500" />
                                    Document Preview
                                </h3>

                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                                    {document.file?.toLowerCase().endsWith('.pdf') ? (
                                        <div className="relative">
                                            <Document
                                                file={`${API_URL}${document.file}`}
                                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                                className="flex flex-col items-center"
                                            >
                                                <Page pageNumber={pageNumber} width={280} />
                                            </Document>

                                            {numPages > 1 && (
                                                <div className="flex items-center justify-center space-x-4 mt-4">
                                                    <button
                                                        onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                                                        disabled={pageNumber <= 1}
                                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 font-medium text-sm"
                                                    >
                                                        Previous
                                                    </button>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                        {pageNumber}/{numPages}
                                                    </span>
                                                    <button
                                                        onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                                                        disabled={pageNumber >= numPages}
                                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 font-medium text-sm"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <DocumentTextIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">Preview not available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default DocumentDetail