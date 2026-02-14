import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { uploadDocument } from '../store/slices/documentSlice'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
    CloudArrowUpIcon,
    DocumentTextIcon,
    PhotoIcon,
    DocumentIcon,
    XMarkIcon,
    CheckCircleIcon,
    ClipboardIcon,
    PencilSquareIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline'

const DocumentUpload = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [textContent, setTextContent] = useState('')
    const [textTitle, setTextTitle] = useState('')
    const [documentType, setDocumentType] = useState('OT')
    const [loading, setLoading] = useState(false)
    const [uploadMethod, setUploadMethod] = useState('file')
    const [uploadProgress, setUploadProgress] = useState(0)
    const [processingStarted, setProcessingStarted] = useState(false)

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0]
        setFile(selectedFile)
        setUploadMethod('file')
        setProcessingStarted(false)

        const fileName = selectedFile.name
        const titleWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))
        setTextTitle(titleWithoutExt)

        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => setPreview(e.target.value)
            reader.readAsDataURL(selectedFile)
        } else {
            setPreview(null)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.webp'],
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
        },
        maxSize: 10485760,
        multiple: false,
        noClick: true,
    })

    const resetForm = () => {
        setFile(null)
        setPreview(null)
        setTextContent('')
        setTextTitle('')
        setDocumentType('OT')
        setUploadProgress(0)
        setProcessingStarted(false)
    }

    const handlePaste = (e) => {
        const pastedText = e.clipboardData?.getData('text') || e.target.value
        setTextContent(pastedText)
        setProcessingStarted(false)

        if (!textTitle) {
            const firstLine = pastedText.split('\n')[0].slice(0, 50)
            setTextTitle(firstLine || 'Pasted Document')
        }
    }

    const handleTextChange = (e) => {
        setTextContent(e.target.value)
        setProcessingStarted(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (processingStarted) {
            console.log('⏳ Processing already started, ignoring duplicate call')
            return
        }

        if (uploadMethod === 'file' && !file) {
            toast.error('Please select a file')
            return
        }

        if (uploadMethod === 'text' && !textContent.trim()) {
            toast.error('Please paste some text')
            return
        }

        setLoading(true)
        setProcessingStarted(true)

        const formData = new FormData()

        if (uploadMethod === 'file') {
            formData.append('file', file)
            formData.append('title', textTitle || file.name)
        } else {
            const textBlob = new Blob([textContent], { type: 'text/plain' })
            const textFile = new File([textBlob], `${textTitle || 'pasted-document'}.txt`, { type: 'text/plain' })
            formData.append('file', textFile)
            formData.append('title', textTitle || 'Pasted Document')
        }

        formData.append('document_type', documentType)

        try {
            const result = await dispatch(uploadDocument(formData))

            if (!result.error && result.payload?.id) {
                console.log('✅ Document uploaded successfully:', result.payload)
                toast.success('Document uploaded successfully!')

                const documentId = result.payload.id
                console.log('📄 Document ID:', documentId)

                const token = localStorage.getItem('token')
                console.log('🔑 Token exists:', !!token)

                if (token) {
                    try {
                        console.log('🚀 Triggering document processing...')
                        const processResponse = await axios.post(
                            `http://localhost:8000/api/documents/${documentId}/process/`,
                            {},
                            {
                                headers: {
                                    Authorization: `Token ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        )
                        console.log('✅ Processing triggered:', processResponse.data)
                        toast.success('Document analysis started!')
                        setTimeout(() => navigate(`/documents/${documentId}`), 1500)
                    } catch (processError) {
                        console.error('❌ Process trigger failed:', processError)
                        toast.error('Upload succeeded but analysis failed to start')
                    }
                }
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Upload failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const getFileIcon = () => {
        if (!file) return CloudArrowUpIcon
        if (file.type?.includes('pdf')) return DocumentTextIcon
        if (file.type?.includes('image')) return PhotoIcon
        return DocumentIcon
    }

    const FileIcon = getFileIcon()

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    Upload Document
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Upload files or paste text for AI-powered risk analysis
                </p>
            </div>

            {/* Method Selector */}
            <div className="flex justify-center space-x-4 mb-6">
                <button
                    onClick={() => {
                        setUploadMethod('file')
                        resetForm()
                    }}
                    className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${uploadMethod === 'file'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                    Upload File
                </button>
                <button
                    onClick={() => {
                        setUploadMethod('text')
                        resetForm()
                    }}
                    className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${uploadMethod === 'text'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <ClipboardIcon className="w-5 h-5 mr-2" />
                    Paste Text
                </button>
            </div>

            {/* Main Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                <form onSubmit={handleSubmit}>
                    {/* File Upload Method */}
                    {uploadMethod === 'file' && (
                        <div
                            {...getRootProps()}
                            onClick={open}
                            className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                                transition-all duration-300 ${isDragActive
                                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 scale-105'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <input {...getInputProps()} />

                            {file ? (
                                <div className="space-y-4">
                                    {preview ? (
                                        <div className="relative w-40 h-40 mx-auto">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg shadow-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setFile(null)
                                                    setPreview(null)
                                                }}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative inline-block">
                                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl flex items-center justify-center">
                                                <FileIcon className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setFile(null)
                                                    setPreview(null)
                                                }}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{file.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-3xl flex items-center justify-center animate-float">
                                        <CloudArrowUpIcon className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                                            {isDragActive ? 'Drop your file here' : 'Drag & drop your document'}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            or <span className="text-primary-600 dark:text-primary-400 font-semibold cursor-pointer hover:underline">browse files</span>
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                            Supported formats: PDF, PNG, JPG, TIFF, TXT (Max 10MB)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Text Paste Method */}
                    {uploadMethod === 'text' && (
                        <div className="space-y-6">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Paste your document text here
                                </label>
                                <textarea
                                    value={textContent}
                                    onChange={handleTextChange}
                                    onPaste={handlePaste}
                                    rows={12}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl
                                        focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                        placeholder:text-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-gray-300 font-mono text-sm
                                        transition-all duration-200"
                                    placeholder="Paste your contract, terms & conditions, privacy policy, or any legal document here..."
                                />
                                {textContent && (
                                    <button
                                        type="button"
                                        onClick={() => setTextContent('')}
                                        className="absolute top-10 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                            hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                <div className="flex items-start">
                                    <ClipboardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Quick Paste Instructions</h4>
                                        <p className="text-xs text-blue-800 dark:text-blue-400">
                                            • Press Ctrl+V (Cmd+V on Mac) to paste your text<br />
                                            • You can paste up to 100,000 characters<br />
                                            • The text will be saved as a .txt file for analysis
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Common Document Details */}
                    {((uploadMethod === 'file' && file) || (uploadMethod === 'text' && textContent)) && !loading && (
                        <div className="mt-8 space-y-6 animate-slide-up">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Document Title
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={textTitle}
                                        onChange={(e) => setTextTitle(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl
                                            focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                                            transition-all duration-200 dark:text-white"
                                        placeholder="Enter document title"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="documentType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Document Type
                                    </label>
                                    <select
                                        id="documentType"
                                        value={documentType}
                                        onChange={(e) => setDocumentType(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl
                                            focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                                            transition-all duration-200 dark:text-white"
                                    >
                                        <option value="TC">Terms & Conditions</option>
                                        <option value="PP">Privacy Policy</option>
                                        <option value="AG">Agreement</option>
                                        <option value="OT">Other</option>
                                    </select>
                                </div>
                            </div>

                            {uploadMethod === 'text' && textContent && (
                                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-2">
                                    <span>📝 Characters: {textContent.length.toLocaleString()}</span>
                                    <span>📊 Words: {textContent.trim().split(/\s+/).filter(Boolean).length.toLocaleString()}</span>
                                    <span>📏 Lines: {textContent.split('\n').length}</span>
                                </div>
                            )}

                            {loading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Processing...</span>
                                        <span className="text-primary-600 dark:text-primary-400 font-semibold">{uploadProgress}%</span>
                                    </div>
                                    <div className="progress-bar h-2 bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="progress-fill bg-gradient-to-r from-primary-500 to-primary-600"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-600
                                        hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200
                                        font-medium shadow-sm hover:shadow-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || processingStarted}
                                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700
                                        text-white rounded-xl hover:from-primary-700 hover:to-primary-800
                                        transition-all duration-200 font-medium shadow-lg
                                        shadow-primary-500/20 hover:shadow-xl disabled:opacity-50
                                        disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                                            Analyze Document
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                        <CloudArrowUpIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">File Upload</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload PDFs, images, or text files. OCR automatically extracts text from scanned documents.
                    </p>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                        <ClipboardIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Text Pasting</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Directly paste contract text for instant analysis.
                    </p>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                        <DocumentTextIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Risk Analysis</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Advanced NLP detects financial, privacy, legal, and subscription risks.
                    </p>
                </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6 border border-primary-100 dark:border-primary-800">
                <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-300 mb-3 flex items-center">
                    <PencilSquareIcon className="w-5 h-5 mr-2" />
                    Pro Tips for Best Results
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-primary-800 dark:text-primary-400">
                    <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 mr-2"></span>
                        For scanned documents, use high-quality images (300 DPI recommended)
                    </li>
                    <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 mr-2"></span>
                        Paste text directly for quick analysis without file upload
                    </li>
                    <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 mr-2"></span>
                        PDFs with text layers provide the highest accuracy
                    </li>
                    <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 mr-2"></span>
                        Maximum file size: 10MB | Maximum text length: 100,000 characters
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default DocumentUpload