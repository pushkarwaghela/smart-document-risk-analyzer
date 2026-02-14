import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
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
} from '@heroicons/react/24/outline'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import Fuse from 'fuse.js'

const DocumentList = () => {
    const dispatch = useDispatch()
    const { documents, loading } = useSelector((state) => state.documents)

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState([])
    const [typeFilter, setTypeFilter] = useState([])
    const [dateRange, setDateRange] = useState([null, null])
    const [startDate, endDate] = dateRange
    const [sortField, setSortField] = useState('uploaded_at')
    const [sortDirection, setSortDirection] = useState('desc')
    const [filteredDocs, setFilteredDocs] = useState([])

    // Fuse.js for fuzzy search
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

        // Apply search
        if (searchQuery) {
            const results = fuse.search(searchQuery)
            filtered = results.map(r => r.item)
        }

        // Apply status filter
        if (statusFilter.length > 0) {
            filtered = filtered.filter(doc =>
                statusFilter.some(f => f.value === doc.status)
            )
        }

        // Apply type filter
        if (typeFilter.length > 0) {
            filtered = filtered.filter(doc =>
                typeFilter.some(f => f.value === doc.document_type)
            )
        }

        // Apply date filter
        if (startDate && endDate) {
            filtered = filtered.filter(doc => {
                const docDate = new Date(doc.uploaded_at)
                return docDate >= startDate && docDate <= endDate
            })
        }

        // Apply sorting
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
        { value: 'PENDING', label: 'Pending' },
        { value: 'PROCESSING', label: 'Processing' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'FAILED', label: 'Failed' },
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
                return <ClockIcon className="w-5 h-5 text-yellow-500" />
            case 'FAILED':
                return <XCircleIcon className="w-5 h-5 text-red-500" />
            default:
                return <ClockIcon className="w-5 h-5 text-gray-400" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            case 'PROCESSING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'FAILED':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
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

    const exportToCSV = () => {
        const csvData = filteredDocs.map(doc => ({
            Title: doc.title,
            Type: doc.document_type,
            Status: doc.status,
            Uploaded: new Date(doc.uploaded_at).toLocaleDateString(),
        }))

        const csv = Papa.unparse(csvData)
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'documents.csv'
        a.click()
    }

    return (
        <div className="space-y-6 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Documents</h1>
                    <p className="text-gray-600 dark:text-gray-400">View and manage your uploaded documents</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={exportToCSV}
                        className="btn-secondary flex items-center"
                    >
                        <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                        Export
                    </button>
                    <Link to="/upload" className="btn-primary">
                        Upload New
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card dark:bg-gray-800 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                            })
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
                    />

                    {/* Date Range */}
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setDateRange(update)}
                        placeholderText="Date range"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredDocs.length} of {documents?.length || 0} documents
            </div>

            {/* Documents Table */}
            <div className="card dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="animate-pulse space-y-4 p-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        ))}
                    </div>
                ) : filteredDocs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
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
                                {filteredDocs.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {doc.title}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
                                                {doc.document_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(doc.uploaded_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStatusIcon(doc.status)}
                                                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                                                    {doc.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link
                                                to={`/documents/${doc.id}`}
                                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                                            >
                                                View Details →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {searchQuery ? 'Try adjusting your search filters' : 'Get started by uploading your first document'}
                        </p>
                        <div className="mt-6">
                            <Link to="/upload" className="btn-primary">
                                Upload Document
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DocumentList