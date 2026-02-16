import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
    Cog6ToothIcon,
    InformationCircleIcon,
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
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ComposedChart,
    Line,
    Scatter,
} from 'recharts'

const Analytics = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [timeframe, setTimeframe] = useState('week')
    const [trendData, setTrendData] = useState([])
    const [documents, setDocuments] = useState([])
    const [selectedMetric, setSelectedMetric] = useState('risks')
    const { token } = useSelector((state) => state.auth)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

    useEffect(() => {
        fetchData()
    }, [timeframe])

    const fetchData = async () => {
        try {
            setLoading(true)

            const statsResponse = await axios.get(`${API_URL}/analyze/statistics/`, {
                headers: { Authorization: `Token ${token}` }
            })
            setStats(statsResponse.data)

            const docsResponse = await axios.get(`${API_URL}/documents/list/`, {
                headers: { Authorization: `Token ${token}` }
            })
            setDocuments(docsResponse.data)

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
                    risks: docsOnDate.reduce((sum, doc) => sum + (doc.risk_count || 0), 0),
                    critical: docsOnDate.reduce((sum, doc) => sum + (doc.critical_count || 0), 0),
                    high: docsOnDate.reduce((sum, doc) => sum + (doc.high_count || 0), 0),
                    medium: docsOnDate.reduce((sum, doc) => sum + (doc.medium_count || 0), 0),
                    low: docsOnDate.reduce((sum, doc) => sum + (doc.low_count || 0), 0),
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 360, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-20 h-20 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"
                    />
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 text-lg text-gray-600 dark:text-gray-400"
                    >
                        Loading analytics...
                    </motion.p>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 min-h-screen"
        >
            {/* Header with Premium Controls */}
            <motion.div
                variants={itemVariants}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Comprehensive insights from your document analysis
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Metric Selector */}
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setSelectedMetric('risks')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedMetric === 'risks'
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Risks
                        </button>
                        <button
                            onClick={() => setSelectedMetric('documents')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedMetric === 'documents'
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Documents
                        </button>
                    </div>

                    {/* Timeframe Selector */}
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
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

                    {/* Export Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportData}
                        className="btn-secondary flex items-center"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        Export
                    </motion.button>
                </div>
            </motion.div>

            {/* Overview Cards with Premium Design */}
            <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {[
                    {
                        title: 'Total Documents',
                        value: stats?.total_documents || 0,
                        icon: DocumentTextIcon,
                        gradient: 'from-blue-500 to-cyan-500',
                        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                        textColor: 'text-blue-600 dark:text-blue-400',
                    },
                    {
                        title: 'Total Risks',
                        value: stats?.total_risks || 0,
                        icon: ShieldExclamationIcon,
                        gradient: 'from-red-500 to-pink-500',
                        bgColor: 'bg-red-50 dark:bg-red-900/20',
                        textColor: 'text-red-600 dark:text-red-400',
                    },
                    {
                        title: 'Risk Categories',
                        value: riskCategoryData.length,
                        icon: ChartBarIcon,
                        gradient: 'from-purple-500 to-indigo-500',
                        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                        textColor: 'text-purple-600 dark:text-purple-400',
                    },
                    {
                        title: 'Risk Density',
                        value: stats?.total_documents ? (stats.total_risks / stats.total_documents).toFixed(1) : 0,
                        icon: ArrowTrendingUpIcon,
                        gradient: 'from-green-500 to-emerald-500',
                        bgColor: 'bg-green-50 dark:bg-green-900/20',
                        textColor: 'text-green-600 dark:text-green-400',
                    },
                ].map((card, index) => (
                    <motion.div
                        key={card.title}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="card dark:bg-gray-800 dark:border-gray-700 relative overflow-hidden group"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                                <p className="text-3xl font-bold mt-1 dark:text-white">{card.value}</p>
                            </div>
                            <div className={`w-14 h-14 ${card.bgColor} rounded-2xl flex items-center justify-center`}>
                                <card.icon className={`w-7 h-7 ${card.textColor}`} />
                            </div>
                        </div>

                        {/* Sparkline Animation */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500"
                        />
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart with Multiple Metrics */}
                <motion.div
                    variants={itemVariants}
                    className="card dark:bg-gray-800 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activity Trend</h2>
                        <div className="flex items-center space-x-2">
                            <InformationCircleIcon className="w-5 h-5 text-gray-400 cursor-help" />
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '350px' }}>
                        <ResponsiveContainer>
                            <ComposedChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="date" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                                    }}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey={selectedMetric === 'risks' ? 'risks' : 'documents'}
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.2}
                                    name={selectedMetric === 'risks' ? 'Risks' : 'Documents'}
                                />
                                {selectedMetric === 'risks' && (
                                    <>
                                        <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                                        <Bar dataKey="high" stackId="a" fill="#f97316" name="High" />
                                        <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
                                        <Bar dataKey="low" stackId="a" fill="#22c55e" name="Low" />
                                    </>
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Risk Category Distribution */}
                <motion.div
                    variants={itemVariants}
                    className="card dark:bg-gray-800 dark:border-gray-700"
                >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Risk Categories</h2>

                    <div style={{ width: '100%', height: '350px' }}>
                        {riskCategoryData.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={riskCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="category"
                                        label={({ category, percent }) =>
                                            `${category}: ${(percent * 100).toFixed(0)}%`
                                        }
                                        labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                                    >
                                        {riskCategoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.category]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: 'none',
                                            borderRadius: '12px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500 dark:text-gray-400">No category data available</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Risk Severity Distribution */}
                <motion.div
                    variants={itemVariants}
                    className="card dark:bg-gray-800 dark:border-gray-700"
                >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Risk Severity</h2>

                    <div style={{ width: '100%', height: '350px' }}>
                        {riskLevelData.length > 0 ? (
                            <ResponsiveContainer>
                                <BarChart data={riskLevelData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                    <XAxis type="number" stroke="#9ca3af" />
                                    <YAxis dataKey="risk_level" type="category" stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: 'none',
                                            borderRadius: '12px',
                                        }}
                                    />
                                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
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
                </motion.div>

                {/* Risk Radar Chart */}
                <motion.div
                    variants={itemVariants}
                    className="card dark:bg-gray-800 dark:border-gray-700"
                >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Risk Profile</h2>

                    <div style={{ width: '100%', height: '350px' }}>
                        <ResponsiveContainer>
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
                                        borderRadius: '12px',
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Recent Documents Table */}
            <motion.div
                variants={itemVariants}
                className="card dark:bg-gray-800 dark:border-gray-700"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Documents</h2>
                    <Link to="/documents" className="text-sm text-primary-600 hover:text-primary-700 font-medium group">
                        View all
                        <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="inline-block ml-1"
                        >
                            →
                        </motion.span>
                    </Link>
                </div>

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
                            <AnimatePresence>
                                {documents.slice(0, 5).map((doc, index) => (
                                    <motion.tr
                                        key={doc.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <Link to={`/documents/${doc.id}`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                                                {doc.title}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{doc.document_type}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${doc.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                doc.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-semibold text-primary-600 dark:text-primary-400">
                                                {doc.risk_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(doc.uploaded_at).toLocaleDateString()}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default Analytics