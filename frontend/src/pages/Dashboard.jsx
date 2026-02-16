import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchDocuments } from '../store/slices/documentSlice'
import { fetchStatistics } from '../store/slices/analysisSlice'
import { useTheme } from '../context/ThemeContext'
import AIPanel from '../components/AIPanel';
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
    CloudArrowUpIcon,
    ExclamationTriangleIcon,
    BellAlertIcon,
    AcademicCapIcon,
} from '@heroicons/react/24/outline'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'

const Dashboard = () => {
    const dispatch = useDispatch()
    const { documents, loading } = useSelector((state) => state.documents)
    const { statistics } = useSelector((state) => state.analysis)
    const { user } = useSelector((state) => state.auth)
    const { darkMode, toggleDarkMode } = useTheme()
    const [greeting, setGreeting] = useState('')
    const [recentTrend, setRecentTrend] = useState([])
    const [stats, setStats] = useState([])

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

    const risks = {
        length: totalRisks,
        filter: (callback) => {
            // Handle different filter scenarios
            const filterStr = callback?.toString() || '';
            if (filterStr.includes('CRITICAL')) {
                return { length: criticalRisks };
            }
            if (filterStr.includes('HIGH')) {
                return { length: highRisks };
            }
            if (filterStr.includes('MEDIUM')) {
                return { length: mediumRisks };
            }
            if (filterStr.includes('LOW')) {
                return { length: lowRisks };
            }
            return { length: totalRisks };
        }
    };

    const riskLevelData = [
        { name: 'Critical', value: criticalRisks, color: '#ef4444' },
        { name: 'High', value: highRisks, color: '#f97316' },
        { name: 'Medium', value: mediumRisks, color: '#eab308' },
        { name: 'Low', value: lowRisks, color: '#22c55e' },
    ].filter(item => item.value > 0)

    const statCards = [
        {
            title: 'Total Documents',
            value: totalDocuments,
            icon: DocumentTextIcon,
            gradient: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400',
            change: totalDocuments > 0 ? '+12%' : '0%',
            trend: totalDocuments > 0 ? 'up' : 'neutral'
        },
        {
            title: 'Total Risks',
            value: totalRisks,
            icon: ShieldExclamationIcon,
            gradient: 'from-red-500 to-pink-500',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            textColor: 'text-red-600 dark:text-red-400',
            change: totalRisks > 0 ? '+8%' : '0%',
            trend: totalRisks > 0 ? 'up' : 'neutral'
        },
        {
            title: 'Critical Risks',
            value: criticalRisks,
            icon: ExclamationTriangleIcon,
            gradient: 'from-purple-500 to-indigo-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            textColor: 'text-purple-600 dark:text-purple-400',
            change: criticalRisks > 0 ? '+5%' : '0%',
            trend: criticalRisks > 0 ? 'up' : 'neutral'
        },
        {
            title: 'Processing',
            value: processingDocs,
            icon: ClockIcon,
            gradient: 'from-yellow-500 to-orange-500',
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
            gradient: 'from-primary-500 to-secondary-500',
            bgColor: 'bg-primary-50 dark:bg-primary-900/20',
        },
        {
            title: 'View Documents',
            description: 'Browse all your analyzed documents',
            icon: MagnifyingGlassIcon,
            link: '/documents',
            gradient: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        },
        {
            title: 'Analytics',
            description: 'View detailed risk statistics',
            icon: ChartBarIcon,
            link: '/analytics',
            gradient: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
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

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 min-h-screen"
        >
            {/* Welcome Section with Animated Background */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-700 p-8 text-white"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] mix-blend-overlay opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative z-10"
                >
                    <h1 className="text-4xl font-bold mb-2">
                        {greeting}, {user?.username || 'User'}!
                        <motion.span
                            animate={{ rotate: [0, 10, 0] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                            className="inline-block ml-2"
                        >
                            👋
                        </motion.span>
                    </h1>
                    <p className="text-primary-100 text-lg max-w-2xl">
                        Welcome to your Smart Document Risk Analyzer. Upload documents to automatically detect and classify risks using advanced AI.
                    </p>
                </motion.div>
                {/* AI Insights Panel */}
                <AIPanel documents={documents} risks={risks} />
                {/* Floating Elements */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        rotate: [0, -5, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-0 right-20 w-48 h-48 bg-white/5 rounded-full blur-3xl"
                />
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="card dark:bg-gray-800 dark:border-gray-700 relative overflow-hidden group"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                                <p className="text-3xl font-bold mt-1 dark:text-white">{stat.value}</p>
                                <div className="flex items-center mt-2">
                                    {stat.trend === 'up' && (
                                        <motion.div
                                            animate={{ y: [0, -3, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                                        </motion.div>
                                    )}
                                    {stat.trend === 'down' && (
                                        <motion.div
                                            animate={{ y: [0, 3, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                                        </motion.div>
                                    )}
                                    <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' :
                                        stat.trend === 'down' ? 'text-red-600' :
                                            'text-gray-500'
                                        }`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">vs last month</span>
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center`}
                            >
                                <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
                            </motion.div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 progress-bar">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((stat.value / 100) * 100, 100)}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className="progress-fill"
                            />
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Distribution Chart */}
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-2 card dark:bg-gray-800 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Risk Distribution</h2>
                        <Link to="/analytics" className="text-sm text-primary-600 hover:text-primary-700 font-medium group">
                            View Details
                            <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="inline-block ml-1"
                            >
                                →
                            </motion.span>
                        </Link>
                    </div>

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
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-center"
                                >
                                    <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No risk data available yet</p>
                                    <Link to="/upload" className="btn-primary mt-4 inline-block">
                                        Upload a document
                                    </Link>
                                </motion.div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    variants={itemVariants}
                    className="card dark:bg-gray-800 dark:border-gray-700"
                >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="flex items-center space-x-4"
                                >
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl skeleton"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 skeleton"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 skeleton"></div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : documents?.length > 0 ? (
                        <div className="space-y-4">
                            {documents.slice(0, 5).map((doc, index) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        to={`/documents/${doc.id}`}
                                        className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all group"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-xl flex items-center justify-center"
                                        >
                                            <DocumentTextIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </motion.div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                                {doc.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <motion.span
                                            whileHover={{ scale: 1.1 }}
                                            className={`badge ${doc.status === 'COMPLETED' ? 'badge-low' :
                                                doc.status === 'PROCESSING' ? 'badge-medium' :
                                                    'bg-gray-500 text-white'
                                                }`}
                                        >
                                            {doc.status}
                                        </motion.span>
                                    </Link>
                                </motion.div>
                            ))}

                            <Link
                                to="/documents"
                                className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium mt-4 py-2 border-t border-gray-100 dark:border-gray-700"
                            >
                                View all documents →
                            </Link>
                        </div>
                    ) : (
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="text-center py-8"
                        >
                            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No documents yet</p>
                            <Link to="/upload" className="btn-primary">
                                Upload your first document
                            </Link>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Quick Actions with Premium Cards */}
            <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {quickActions.map((action, index) => (
                    <motion.div
                        key={action.title}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            to={action.link}
                            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 block"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                            <div className="flex items-start space-x-4">
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center`}
                                >
                                    <action.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                </motion.div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{action.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                                </div>
                            </div>

                            {/* Animated Border */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileHover={{ scaleX: 1 }}
                                transition={{ duration: 0.3 }}
                                className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500 origin-left"
                            />
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* AI Insights Premium Card */}
            <motion.div
                variants={itemVariants}
                className="card bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-0 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] mix-blend-overlay opacity-5"></div>

                <div className="relative z-10 flex items-start space-x-4">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30"
                    >
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </motion.div>

                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">AI Insights</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            {totalDocuments === 0 ? (
                                "Upload your first document to start analyzing risks. Our AI will automatically detect and classify potential risks in your documents."
                            ) : (
                                `Based on your ${totalDocuments} documents, we found ${totalRisks} potential risks. 
                                ${criticalRisks} critical issues require immediate attention. 
                                Check the risk report for detailed analysis.`
                            )}
                        </p>
                    </div>

                    {/* Animated Dots */}
                    <div className="flex space-x-1">
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ y: [0, -5, 0] }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                                className="w-2 h-2 bg-primary-400 rounded-full"
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default Dashboard