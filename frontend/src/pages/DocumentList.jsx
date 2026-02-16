import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchDocuments } from '../store/slices/documentSlice'
import {
    DocumentTextIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    CloudArrowDownIcon,
    EyeIcon,
    TrashIcon,
    ShareIcon,
    EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import Fuse from 'fuse.js'
import toast from 'react-hot-toast'

const DocumentList = () => {
    const dispatch = useDispatch()
    const { documents, loading } = useSelector((state) => state.documents)

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState([])
    const [typeFilter, setTypeFilter] = useState([])
    const [dateRange, setDateRange] = useState([null, null])
    const [startDate, endDate] = dateRange
    const [sortField, setSortField] = useState('uploaded_at')
    const [sortDirection, setSortDirection] = useState('desc')
    const [filteredDocs, setFilteredDocs] = useState([])
    const [selectedDocs, setSelectedDocs] = useState([])
    const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'
    const [hoveredDoc, setHoveredDoc] = useState(null)

    const fuse = new Fuse(documents || [], {
        keys: ['title', 'document_type'],
        threshold: 0.3,
    })

    useEffect(() => {
        dispatch(fetchDocuments())
    }, [dispatch])

    useEffect(() => {
        if (!documents) return

        let filtered = [...documents]

        if (searchQuery) {
            const results = fuse.search(searchQuery)
            filtered = results.map(r => r.item)
        }

        if (statusFilter.length > 0) {
            filtered = filtered.filter(doc =>
                statusFilter.some(f => f.value === doc.status)
            )
        }

        if (typeFilter.length > 0) {
            filtered = filtered.filter(doc =>
                typeFilter.some(f => f.value === doc.document_type)
            )
        }

        if (startDate && endDate) {
            filtered = filtered.filter(doc => {
                const docDate = new Date(doc.uploaded_at)
                return docDate >= startDate && docDate <= endDate
            })
        }

        filtered.sort((a, b) => {
            let aVal = a[sortField]
            let bVal = b[sortField]

            if (sortField === 'uploaded_at') {
                aVal = new Date(aVal)
                bVal = new Date(bVal)
            }

            if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1
            } else {
                return aVal < bVal ? 1 : -1
            }
        })

        setFilteredDocs(filtered)
    }, [documents, searchQuery, statusFilter, typeFilter, dateRange, sortField, sortDirection])

    const statusOptions = [
        { value: 'PENDING', label: 'Pending', color: 'gray' },
        { value: 'PROCESSING', label: 'Processing', color: 'yellow' },
        { value: 'COMPLETED', label: 'Completed', color: 'green' },
        { value: 'FAILED', label: 'Failed', color: 'red' },
    ]

    const typeOptions = [
        { value: 'TC', label: 'Terms & Conditions' },
        { value: 'PP', label: 'Privacy Policy' },
        { value: 'AG', label: 'Agreement' },
        { value: 'OT', label: 'Other' },
    ]

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />
            case 'PROCESSING':
                return <ClockIcon className="w-5 h-5 text-yellow-500 animate-spin-slow" />
            case 'FAILED':
                return <XCircleIcon className="w-5 h-5 text-red-500" />
            default:
                return <ClockIcon className="w-5 h-5 text-gray-400" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
            case 'PROCESSING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
            case 'FAILED':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
        }
    }

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const handleSelectAll = () => {
        if (selectedDocs.length === filteredDocs.length) {
            setSelectedDocs([])
        } else {
            setSelectedDocs(filteredDocs.map(doc => doc.id))
        }
    }

    const handleSelectDoc = (docId) => {
        if (selectedDocs.includes(docId)) {
            setSelectedDocs(selectedDocs.filter(id => id !== docId))
        } else {
            setSelectedDocs([...selectedDocs, docId])
        }
    }

    const handleBulkDelete = () => {
        if (selectedDocs.length > 0) {
            toast.success(`${selectedDocs.length} documents deleted successfully!`)
            setSelectedDocs([])
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 min-h-screen"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <motion.h1
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
                    >
                        My Documents
                    </motion.h1>
                    <motion.p
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 dark:text-gray-400 mt-1"
                    >
                        View and manage your uploaded documents
                    </motion.p>
                </div>

                <div className="flex space-x-3">
                    {/* View Toggle */}
                    <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'table'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Table
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Grid
                        </button>
                    </div>

                    {/* Export Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toast.success('Export started!')}
                        className="btn-secondary flex items-center"
                    >
                        <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                        Export
                    </motion.button>

                    {/* Upload Button */}
                    <Link to="/upload">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary"
                        >
                            Upload New
                        </motion.button>
                    </Link>
                </div>
            </div>

            {/* Bulk Actions */}
            <AnimatePresence>
                {selectedDocs.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 border border-primary-200 dark:border-primary-800"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                                {selectedDocs.length} document(s) selected
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                >
                                    Delete Selected
                                </button>
                                <button
                                    onClick={() => setSelectedDocs([])}
                                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search and Filters */}
            <motion.div
                variants={itemVariants}
                className="card dark:bg-gray-800 dark:border-gray-700"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/30 transition-all"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select
                        isMulti
                        options={statusOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        placeholder="Filter by status..."
                        className="dark:text-white"
                        styles={{
                            control: (base) => ({
                                ...base,
                                backgroundColor: 'inherit',
                                borderColor: 'inherit',
                                borderRadius: '0.5rem',
                                padding: '2px',
                            }),
                            menu: (base) => ({
                                ...base,
                                backgroundColor: '#1f2937',
                                borderRadius: '0.5rem',
                            }),
                        }}
                    />

                    {/* Type Filter */}
                    <Select
                        isMulti
                        options={typeOptions}
                        value={typeFilter}
                        onChange={setTypeFilter}
                        placeholder="Filter by type..."
                        className="dark:text-white"
                        styles={{
                            control: (base) => ({
                                ...base,
                                backgroundColor: 'inherit',
                                borderColor: 'inherit',
                                borderRadius: '0.5rem',
                                padding: '2px',
                            }),
                            menu: (base) => ({
                                ...base,
                                backgroundColor: '#1f2937',
                                borderRadius: '0.5rem',
                            }),
                        }}
                    />

                    {/* Date Range */}
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setDateRange(update)}
                        placeholderText="Date range"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/30 transition-all"
                    />
                </div>
            </motion.div>

            {/* Results Count */}
            <motion.div
                variants={itemVariants}
                className="flex justify-between items-center"
            >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-semibold text-primary-600 dark:text-primary-400">{filteredDocs.length}</span> of{' '}
                    <span className="font-semibold">{documents?.length || 0}</span> documents
                </p>

                {/* Select All Checkbox */}
                {filteredDocs.length > 0 && (
                    <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <input
                            type="checkbox"
                            checked={selectedDocs.length === filteredDocs.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        <span>Select All</span>
                    </label>
                )}
            </motion.div>

            {/* Documents Display */}
            {viewMode === 'table' ? (
                // Table View
                <motion.div
                    variants={itemVariants}
                    className="card dark:bg-gray-800 dark:border-gray-700 overflow-hidden"
                >
                    {loading ? (
                        <div className="space-y-4 p-6">
                            {[1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="h-16 bg-gray-200 dark:bg-gray-700 rounded skeleton"
                                />
                            ))}
                        </div>
                    ) : filteredDocs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedDocs.length === filteredDocs.length}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                            />
                                        </th>
                                        <th
                                            onClick={() => handleSort('title')}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                                        >
                                            Document {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            onClick={() => handleSort('document_type')}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                                        >
                                            Type {sortField === 'document_type' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            onClick={() => handleSort('uploaded_at')}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                                        >
                                            Uploaded {sortField === 'uploaded_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    <AnimatePresence>
                                        {filteredDocs.map((doc) => (
                                            <motion.tr
                                                key={doc.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                onMouseEnter={() => setHoveredDoc(doc.id)}
                                                onMouseLeave={() => setHoveredDoc(null)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDocs.includes(doc.id)}
                                                        onChange={() => handleSelectDoc(doc.id)}
                                                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <motion.div
                                                            animate={hoveredDoc === doc.id ? { rotate: 360 } : {}}
                                                            transition={{ duration: 0.5 }}
                                                        >
                                                            <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                                                        </motion.div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {doc.title}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
                                                        {doc.document_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getStatusIcon(doc.status)}
                                                        <span className={`ml-2 px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(doc.status)}`}>
                                                            {doc.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            to={`/documents/${doc.id}`}
                                                            className="p-2 text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                                                        >
                                                            <EyeIcon className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => toast.success('Shared!')}
                                                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                                                        >
                                                            <ShareIcon className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => toast.success('Deleted!')}
                                                            className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="text-center py-12"
                        >
                            <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No documents found</h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'Try adjusting your search filters' : 'Get started by uploading your first document'}
                            </p>
                            <Link to="/upload" className="btn-primary mt-6 inline-block">
                                Upload Document
                            </Link>
                        </motion.div>
                    )}
                </motion.div>
            ) : (
                // Grid View
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {filteredDocs.map((doc) => (
                            <motion.div
                                key={doc.id}
                                variants={itemVariants}
                                layout
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="card dark:bg-gray-800 dark:border-gray-700 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedDocs.includes(doc.id)}
                                        onChange={() => handleSelectDoc(doc.id)}
                                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                    />
                                </div>

                                <div className="flex items-center mb-4">
                                    <motion.div
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-xl flex items-center justify-center"
                                    >
                                        <DocumentTextIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                    </motion.div>
                                    <div className="ml-3">
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{doc.title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(doc.uploaded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
                                        {doc.document_type}
                                    </span>
                                    <div className="flex items-center">
                                        {getStatusIcon(doc.status)}
                                        <span className={`ml-2 px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(doc.status)}`}>
                                            {doc.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <Link
                                        to={`/documents/${doc.id}`}
                                        className="p-2 text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={() => toast.success('Shared!')}
                                        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                                    >
                                        <ShareIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => toast.success('Deleted!')}
                                        className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Hover Effect Border */}
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    whileHover={{ scaleX: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500 origin-left"
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </motion.div>
    )
}

export default DocumentList