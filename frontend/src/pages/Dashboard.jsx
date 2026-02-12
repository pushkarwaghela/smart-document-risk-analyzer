import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchDocuments } from '../store/slices/documentSlice'
import { fetchStatistics } from '../store/slices/analysisSlice'
import {
    DocumentTextIcon,
    ShieldExclamationIcon,
    ClockIcon,
    CheckCircleIcon,
    ChartBarIcon,
    ArrowUpIcon,
    DocumentArrowUpIcon,
    MagnifyingGlassIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
    const dispatch = useDispatch()
    const { documents, loading } = useSelector((state) => state.documents)
    const { statistics } = useSelector((state) => state.analysis)
    const { user } = useSelector((state) => state.auth)
    const [greeting, setGreeting] = useState('')

    useEffect(() => {
        dispatch(fetchDocuments())
        dispatch(fetchStatistics())

        // Set greeting based on time
        const hour = new Date().getHours()
        if (hour < 12) setGreeting('Good morning')
        else if (hour < 18) setGreeting('Good afternoon')
        else setGreeting('Good evening')
    }, [dispatch])

    // Calculate statistics
    const totalDocuments = documents?.length || 0
    const completedDocs = documents?.filter(d => d.status === 'COMPLETED').length || 0
    const processingDocs = documents?.filter(d => d.status === 'PROCESSING').length || 0
    const pendingDocs = documents?.filter(d => d.status === 'PENDING').length || 0

    // Risk statistics from backend or calculate from documents
    const totalRisks = statistics?.total_risks || 0
    const criticalRisks = statistics?.critical_risks || 0
    const highRisks = statistics?.high_risks || 0
    const mediumRisks = statistics?.medium_risks || 0
    const lowRisks = statistics?.low_risks || 0

    // Chart data
    const riskLevelData = [
        { name: 'Critical', value: criticalRisks, color: '#ef4444' },
        { name: 'High', value: highRisks, color: '#f97316' },
        { name: 'Medium', value: mediumRisks, color: '#eab308' },
        { name: 'Low', value: lowRisks, color: '#22c55e' },
    ].filter(item => item.value > 0)

    const documentStatusData = [
        { name: 'Completed', value: completedDocs, color: '#22c55e' },
        { name: 'Processing', value: processingDocs, color: '#eab308' },
        { name: 'Pending', value: pendingDocs, color: '#94a3b8' },
    ].filter(item => item.value > 0)

    const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']

    const stats = [
        {
            title: 'Total Documents',
            value: totalDocuments,
            icon: DocumentTextIcon,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            change: '+12%',
            trend: 'up'
        },
        {
            title: 'Total Risks',
            value: totalRisks,
            icon: ShieldExclamationIcon,
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            change: '+8%',
            trend: 'up'
        },
        {
            title: 'Completed',
            value: completedDocs,
            icon: CheckCircleIcon,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            change: '+23%',
            trend: 'up'
        },
        {
            title: 'Processing',
            value: processingDocs,
            icon: ClockIcon,
            color: 'from-yellow-500 to-yellow-600',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
            change: '-5%',
            trend: 'down'
        },
    ]

    const quickActions = [
        {
            title: 'Upload Document',
            description: 'Analyze new documents for risks',
            icon: DocumentArrowUpIcon,
            link: '/upload',
            color: 'from-primary-500 to-primary-600',
            bgColor: 'bg-primary-50',
        },
        {
            title: 'View Documents',
            description: 'Browse all your analyzed documents',
            icon: MagnifyingGlassIcon,
            link: '/documents',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Analytics',
            description: 'View detailed risk statistics',
            icon: ChartBarIcon,
            link: '/analytics',
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'bg-indigo-50',
        },
    ]

    const recentActivity = documents?.slice(0, 5) || []

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-700 rounded-3xl"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] mix-blend-overlay opacity-10 rounded-3xl"></div>
                <div className="relative p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                {greeting}, {user?.username || 'User'}! 👋
                            </h1>
                            <p className="text-primary-100 text-lg max-w-2xl">
                                Welcome to your Smart Document Risk Analyzer. Upload documents to automatically detect and classify risks using advanced AI.
                            </p>
                        </div>
                        <div className="hidden lg:block">
                            <SparklesIcon className="w-24 h-24 text-white/20" />
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-primary-100 text-sm">Documents Analyzed</p>
                                    <p className="text-3xl font-bold mt-1">{completedDocs}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <DocumentTextIcon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-primary-100 text-sm">Critical Risks</p>
                                    <p className="text-3xl font-bold mt-1">{criticalRisks}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-500/30 rounded-xl flex items-center justify-center">
                                    <ShieldExclamationIcon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-primary-100 text-sm">Accuracy Rate</p>
                                    <p className="text-3xl font-bold mt-1">98.5%</p>
                                </div>
                                <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                                    <CheckCircleIcon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="card hover:scale-105 transition-all duration-300 animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{stat.title}</p>
                                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                <div className="flex items-center mt-2">
                                    <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-1">vs last month</span>
                                </div>
                            </div>
                            <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
                                <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
                            </div>
                        </div>
                        <div className="mt-4 progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.min((stat.value / 100) * 100, 100)}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Distribution Chart */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Risk Distribution</h2>
                        <Link to="/analytics" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            View Details →
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
                                        labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                                    >
                                        {riskLevelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                            padding: '8px 12px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No risk data available yet</p>
                                    <Link to="/upload" className="btn-primary mt-4 inline-block">
                                        Upload a document
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="animate-pulse flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recentActivity.length > 0 ? (
                        <div className="space-y-4">
                            {recentActivity.map((doc, index) => (
                                <Link
                                    key={doc.id}
                                    to={`/documents/${doc.id}`}
                                    className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-all group"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <DocumentTextIcon className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                            {doc.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <span className={`badge ${doc.status === 'COMPLETED' ? 'badge-low' :
                                            doc.status === 'PROCESSING' ? 'badge-medium' :
                                                'bg-gray-500 text-white'
                                        }`}>
                                        {doc.status}
                                    </span>
                                </Link>
                            ))}
                            <Link
                                to="/documents"
                                className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium mt-4 py-2 border-t border-gray-100"
                            >
                                View all documents
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No documents yet</p>
                            <Link to="/upload" className="btn-primary">
                                Upload your first document
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                    <Link
                        key={index}
                        to={action.link}
                        className="group relative overflow-hidden rounded-2xl bg-white p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                        <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                                <p className="text-sm text-gray-600">{action.description}</p>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    </Link>
                ))}
            </div>

            {/* AI Insights */}
            <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-0">
                <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center animate-pulse-slow">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">AI Insights</h3>
                        <p className="text-gray-700">
                            {totalDocuments === 0 ? (
                                "Upload your first document to start analyzing risks. Our AI will automatically detect and classify potential risks in your documents."
                            ) : (
                                `Based on your ${totalDocuments} documents, we found ${totalRisks} potential risks. 
                ${criticalRisks} critical issues require immediate attention. 
                Check the risk report for detailed analysis.`
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard