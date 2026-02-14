import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchDocuments } from '../store/slices/documentSlice'
import { fetchStatistics } from '../store/slices/analysisSlice'
import { useTheme } from '../context/ThemeContext'
import {
    DocumentTextIcon,
    ShieldExclamationIcon,
    ClockIcon,
    CheckCircleIcon,
    ChartBarIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    DocumentArrowUpIcon,
    MagnifyingGlassIcon,
    SparklesIcon,
    SunIcon,
    MoonIcon,
    CloudArrowUpIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

const Dashboard = () => {
    const dispatch = useDispatch()
    const { documents, loading } = useSelector((state) => state.documents)
    const { statistics } = useSelector((state) => state.analysis)
    const { user } = useSelector((state) => state.auth)
    const { darkMode, toggleDarkMode } = useTheme()
    const [greeting, setGreeting] = useState('')
    const [recentTrend, setRecentTrend] = useState([])

    useEffect(() => {
        dispatch(fetchDocuments())
        dispatch(fetchStatistics())

        const hour = new Date().getHours()
        if (hour < 12) setGreeting('Good morning')
        else if (hour < 18) setGreeting('Good afternoon')
        else setGreeting('Good evening')

        // Generate trend data
        const last7Days = [...Array(7)].map((_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            return {
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                documents: Math.floor(Math.random() * 5),
                risks: Math.floor(Math.random() * 15)
            }
        }).reverse()
        setRecentTrend(last7Days)
    }, [dispatch])

    const totalDocuments = documents?.length || 0
    const completedDocs = documents?.filter(d => d.status === 'COMPLETED').length || 0
    const processingDocs = documents?.filter(d => d.status === 'PROCESSING').length || 0
    const pendingDocs = documents?.filter(d => d.status === 'PENDING').length || 0

    const totalRisks = statistics?.total_risks || 0
    const criticalRisks = statistics?.critical_risks || 0
    const highRisks = statistics?.high_risks || 0
    const mediumRisks = statistics?.medium_risks || 0
    const lowRisks = statistics?.low_risks || 0

    const riskLevelData = [
        { name: 'Critical', value: criticalRisks, color: '#ef4444' },
        { name: 'High', value: highRisks, color: '#f97316' },
        { name: 'Medium', value: mediumRisks, color: '#eab308' },
        { name: 'Low', value: lowRisks, color: '#22c55e' },
    ].filter(item => item.value > 0)

    const stats = [
        {
            title: 'Total Documents',
            value: totalDocuments,
            icon: DocumentTextIcon,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400',
            change: totalDocuments > 0 ? '+12%' : '0%',
            trend: totalDocuments > 0 ? 'up' : 'neutral'
        },
        {
            title: 'Total Risks',
            value: totalRisks,
            icon: ShieldExclamationIcon,
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            textColor: 'text-red-600 dark:text-red-400',
            change: totalRisks > 0 ? '+8%' : '0%',
            trend: totalRisks > 0 ? 'up' : 'neutral'
        },
        {
            title: 'Critical Risks',
            value: criticalRisks,
            icon: ExclamationTriangleIcon,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            textColor: 'text-purple-600 dark:text-purple-400',
            change: criticalRisks > 0 ? '+5%' : '0%',
            trend: criticalRisks > 0 ? 'up' : 'neutral'
        },
        {
            title: 'Processing',
            value: processingDocs,
            icon: ClockIcon,
            color: 'from-yellow-500 to-yellow-600',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            textColor: 'text-yellow-600 dark:text-yellow-400',
            change: processingDocs > 0 ? '-2%' : '0%',
            trend: processingDocs > 0 ? 'down' : 'neutral'
        },
    ]

    const quickActions = [
        {
            title: 'Upload Document',
            description: 'Analyze new documents for risks',
            icon: CloudArrowUpIcon,
            link: '/upload',
            color: 'from-primary-500 to-primary-600',
            bgColor: 'bg-primary-50 dark:bg-primary-900/20',
        },
        {
            title: 'View Documents',
            description: 'Browse all your analyzed documents',
            icon: MagnifyingGlassIcon,
            link: '/documents',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        },
        {
            title: 'Analytics',
            description: 'View detailed risk statistics',
            icon: ChartBarIcon,
            link: '/analytics',
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
    ]

    return (
        <div className="space-y-8 animate-fade-in dark:bg-gray-900 min-h-screen">
            {/* Header with Dark Mode Toggle */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        {greeting}, {user?.username || 'User'}! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Welcome to your Smart Document Risk Analyzer
                    </p>
                </div>
                <button
                    onClick={toggleDarkMode}
                    className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                    {darkMode ? (
                        <SunIcon className="w-6 h-6 text-yellow-500" />
                    ) : (
                        <MoonIcon className="w-6 h-6 text-gray-700" />
                    )}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="card dark:bg-gray-800 dark:border-gray-700 hover:scale-105 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                                <p className="text-3xl font-bold mt-1 dark:text-white">{stat.value}</p>
                                <div className="flex items-center mt-2">
                                    {stat.trend === 'up' && <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />}
                                    {stat.trend === 'down' && <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />}
                                    <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' :
                                            stat.trend === 'down' ? 'text-red-600' :
                                                'text-gray-500'
                                        }`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">vs last month</span>
                                </div>
                            </div>
                            <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
                                <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Distribution */}
                <div className="lg:col-span-2 card dark:bg-gray-800 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Risk Distribution</h2>
                    <div className="h-80">
                        {riskLevelData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={riskLevelData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {riskLevelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500 dark:text-gray-400">No risk data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card dark:bg-gray-800 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                    {documents?.slice(0, 5).map((doc, idx) => (
                        <Link
                            key={doc.id}
                            to={`/documents/${doc.id}`}
                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all mb-2"
                        >
                            <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {doc.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                </p>
                            </div>
                            <span className={`badge ${doc.status === 'COMPLETED' ? 'badge-low' :
                                    doc.status === 'PROCESSING' ? 'badge-medium' :
                                        'badge-critical'
                                }`}>
                                {doc.status}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                    <Link
                        key={index}
                        to={action.link}
                        className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{action.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Dashboard