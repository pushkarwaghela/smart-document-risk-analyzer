import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const RiskReport = () => {
    const { id } = useParams()
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const { token } = useSelector((state) => state.auth)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

    useEffect(() => {
        fetchReport()
    }, [id])

    const fetchReport = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${API_URL}/analyze/documents/${id}/report/`, {
                headers: { Authorization: `Token ${token}` }
            })
            setReport(response.data)
        } catch (error) {
            console.error('Error fetching report:', error)
        } finally {
            setLoading(false)
        }
    }

    const COLORS = ['#dc2626', '#ea580c', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!report) {
        return <div>Report not found</div>
    }

    // Prepare data for charts
    const riskLevelData = [
        { name: 'Critical', value: report.critical_risks },
        { name: 'High', value: report.high_risks },
        { name: 'Medium', value: report.medium_risks },
        { name: 'Low', value: report.low_risks },
    ].filter(item => item.value > 0)

    const riskCategoryData = report.risk_summary
        ? Object.entries(report.risk_summary).map(([key, value]) => ({
            name: key,
            value: value.count
        }))
        : []

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to={`/documents/${id}`} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Risk Analysis Report</h1>
                        <p className="text-gray-600">{report.document_title}</p>
                    </div>
                </div>
                <button className="btn-secondary flex items-center">
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    Download PDF
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                    <p className="text-sm text-primary-600 font-medium">Total Risks</p>
                    <p className="text-3xl font-bold text-primary-700">{report.total_risks}</p>
                </div>
                <div className="card bg-red-50 border-red-200">
                    <p className="text-sm text-red-600 font-medium">Critical</p>
                    <p className="text-3xl font-bold text-red-700">{report.critical_risks}</p>
                </div>
                <div className="card bg-orange-50 border-orange-200">
                    <p className="text-sm text-orange-600 font-medium">High</p>
                    <p className="text-3xl font-bold text-orange-700">{report.high_risks}</p>
                </div>
                <div className="card bg-yellow-50 border-yellow-200">
                    <p className="text-sm text-yellow-600 font-medium">Medium</p>
                    <p className="text-3xl font-bold text-yellow-700">{report.medium_risks}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Level Distribution */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskLevelData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {riskLevelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Category Distribution */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Category Distribution</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={riskCategoryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Risk Clauses */}
            <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Risky Clauses</h2>
                <div className="space-y-4">
                    {report.top_risky_clauses?.map((risk, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${risk.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                            risk.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {risk.risk_level}
                                    </span>
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                        {risk.category_display}
                                    </span>
                                </div>
                                <p className="text-gray-700">{risk.clause_text}</p>
                                <p className="text-xs text-gray-500 mt-1">{risk.explanation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default RiskReport