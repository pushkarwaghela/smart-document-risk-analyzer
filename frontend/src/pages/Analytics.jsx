import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
    ChartBarIcon,
    DocumentTextIcon,
    ShieldExclamationIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CalendarIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from 'recharts'

const Analytics = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [timeframe, setTimeframe] = useState('week')
    const [trendData, setTrendData] = useState([])
    const [documents, setDocuments] = useState([])
    const { token } = useSelector((state) => state.auth)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

    useEffect(() => {
        fetchData()
    }, [timeframe])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Fetch statistics
            const statsResponse = await axios.get(`${API_URL}/analyze/statistics/`, {
                headers: { Authorization: `Token ${token}` }
            })
            setStats(statsResponse.data)

            // Fetch documents for trend data
            const docsResponse = await axios.get(`${API_URL}/documents/list/`, {
                headers: { Authorization: `Token ${token}` }
            })
            setDocuments(docsResponse.data)

            // Generate real trend data
            const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365
            const data = []
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const dateStr = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                })

                const docsOnDate = docsResponse.data.filter(doc => {
                    const docDate = new Date(doc.uploaded_at).toDateString()
                    return docDate === date.toDateString()
                })

                data.push({
                    date: dateStr,
                    documents: docsOnDate.length,
                    risks: docsOnDate.reduce((sum, doc) => sum + (doc.risk_count || 0), 0)
                })
            }
            setTrendData(data)

        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const exportData = () => {
        const exportData = {
            statistics: stats,
            documents: documents,
            generatedAt: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
    }

    const COLORS = {
        FINANCIAL: '#3b82f6',
        PRIVACY: '#8b5cf6',
        LEGAL: '#6366f1',
        SUBSCRIPTION: '#ec4899',
        CRITICAL: '#ef4444',
        HIGH: '#f97316',
        MEDIUM: '#eab308',
        LOW: '#22c55e',
    }

    const riskCategoryData = stats?.risk_by_category || []
    const riskLevelData = stats?.risk_by_level || []

    const radarData = [
        { category: 'Financial', value: riskCategoryData.find(d => d.category === 'FINANCIAL')?.count || 0 },
        { category: 'Privacy', value: riskCategoryData.find(d => d.category === 'PRIVACY')?.count || 0 },
        { category: 'Legal', value: riskCategoryData.find(d => d.category === 'LEGAL')?.count || 0 },
        { category: 'Subscription', value: riskCategoryData.find(d => d.category === 'SUBSCRIPTION')?.count || 0 },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in dark:bg-gray-900 min-h-screen">
            {/* Header with Export */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Comprehensive insights from your document analysis
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    {/* Timeframe Selector */}
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
                        {['week', 'month', 'year'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setTimeframe(period)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${timeframe === period
                                        ? 'bg-primary-600 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={exportData}
                        className="btn-secondary flex items-center"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Documents</p>
                            <p className="text-3xl font-bold mt-1 dark:text-white">{stats?.total_documents || 0}</p>
                        </div>
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                            <DocumentTextIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="card dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Risks</p>
                            <p className="text-3xl font-bold mt-1 dark:text-white">{stats?.total_risks || 0}</p>
                        </div>
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                            <ShieldExclamationIcon className="w-7 h-7 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </div>
                <div className="card dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Risk Categories</p>
                            <p className="text-3xl font-bold mt-1 dark:text-white">{riskCategoryData.length}</p>
                        </div>
                        <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
                            <ChartBarIcon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>
                <div className="card dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Risk Density</p>
                            <p className="text-3xl font-bold mt-1 dark:text-white">
                                {stats?.total_documents ? (stats.total_risks / stats.total_documents).toFixed(1) : 0}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
                            <ArrowTrendingUpIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <div className="card dark:bg-gray-800 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Activity Trend</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="documentsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="risksGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="documents"
                                    stroke="#3b82f6"
                                    fill="url(#documentsGradient)"
                                    name="Documents"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="risks"
                                    stroke="#ef4444"
                                    fill="url(#risksGradient)"
                                    name="Risks"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Category Distribution */}
                <div className="card dark:bg-gray-800 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Risk Categories</h2>
                    <div className="h-80">
                        {riskCategoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={riskCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="category"
                                        label={({ category, percent }) =>
                                            `${category}: ${(percent * 100).toFixed(0)}%`
                                        }
                                    >
                                        {riskCategoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.category]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500 dark:text-gray-400">No category data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Risk Levels Bar Chart */}
                <div className="card dark:bg-gray-800 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Risk Severity</h2>
                    <div className="h-80">
                        {riskLevelData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={riskLevelData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="risk_level" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: 'none',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                        {riskLevelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.risk_level]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500 dark:text-gray-400">No risk level data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Risk Radar Chart */}
                <div className="card dark:bg-gray-800 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Risk Profile</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="category" stroke="#9ca3af" />
                                <PolarRadiusAxis stroke="#9ca3af" />
                                <Radar
                                    name="Risks"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.6}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Documents Table */}
            <div className="card dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Documents</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Document
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Risks
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Uploaded
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {documents.slice(0, 5).map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4">
                                        <Link to={`/documents/${doc.id}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                                            {doc.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{doc.document_type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${doc.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                doc.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{doc.risk_count || 0}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(doc.uploaded_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Analytics