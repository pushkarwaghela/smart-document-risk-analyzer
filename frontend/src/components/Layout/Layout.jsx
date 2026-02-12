import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import {
    HomeIcon,
    DocumentArrowUpIcon,
    DocumentTextIcon,
    ChartBarIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    Cog6ToothIcon,
    BellIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const Layout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [notifications] = useState(3)

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Upload Document', href: '/upload', icon: DocumentArrowUpIcon },
        { name: 'My Documents', href: '/documents', icon: DocumentTextIcon },
        { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-10 px-4 py-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {sidebarOpen ? (
                            <XMarkIcon className="w-6 h-6 text-gray-600" />
                        ) : (
                            <Bars3Icon className="w-6 h-6 text-gray-600" />
                        )}
                    </button>

                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                            <ShieldCheckIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="ml-2 font-bold text-gray-900">Risk Analyzer</span>
                    </div>

                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                        <BellIcon className="w-6 h-6 text-gray-600" />
                        {notifications > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 w-72 bg-white/80 backdrop-blur-xl shadow-2xl z-30 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 border-r border-white/20
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-20 flex items-center px-6 border-b border-gray-200/50">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg flex items-center justify-center">
                                <ShieldCheckIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                    Risk Analyzer
                                </h1>
                                <p className="text-xs text-gray-500">Smart Document Analysis</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                   ${isActive
                                        ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 shadow-sm border border-primary-100'
                                        : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110
                      ${isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-primary-600'}`}
                                        />
                                        <span className="flex-1">{item.name}</span>
                                        {isActive && (
                                            <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User profile */}
                    <div className="p-4 border-t border-gray-200/50">
                        <div className="flex items-center p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 ml-3">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {user?.username}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                                title="Logout"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Settings link */}
                        <div className="mt-2">
                            <NavLink
                                to="/settings"
                                className="flex items-center px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Cog6ToothIcon className="w-4 h-4 mr-2" />
                                Settings
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-72">
                <main className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default Layout