import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { useTheme } from '../../context/ThemeContext'
import NotificationBell from '../NotificationBell'

import {
    HomeIcon,
    DocumentArrowUpIcon,
    DocumentTextIcon,
    ChartBarIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    Cog6ToothIcon,
    ShieldCheckIcon,
    SunIcon,
    MoonIcon,
} from '@heroicons/react/24/outline'

const Layout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const { darkMode, toggleDarkMode } = useTheme()
    const [sidebarOpen, setSidebarOpen] = useState(false)

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-20 lg:hidden dark:bg-gray-950/80"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 z-10 px-4 py-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        {sidebarOpen ? (
                            <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        ) : (
                            <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        )}
                    </button>

                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                            <ShieldCheckIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="ml-2 font-bold text-gray-900 dark:text-white">Risk Analyzer</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {darkMode ? (
                                <SunIcon className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            )}
                        </button>
                        <NotificationBell position="right" />  {/* Dropdown opens to the right */}
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 w-72 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl z-30
                transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 border-r border-white/20 dark:border-gray-700/50
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-20 flex items-center px-6 border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg flex items-center justify-center">
                                <ShieldCheckIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                    Risk Analyzer
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Smart Document Analysis</p>
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
                                        ? 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 text-primary-700 dark:text-primary-300 shadow-sm border border-primary-100 dark:border-primary-800'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110
                                            ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'}`}
                                        />
                                        <span className="flex-1">{item.name}</span>
                                        {isActive && (
                                            <span className="w-1.5 h-1.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User profile section with 3-column grid */}
                    <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        {/* User info */}
                        <div className="flex items-center p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl mb-3">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 ml-3">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {user?.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
                                title="Logout"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* 3-Column Grid for Theme, Notifications, Settings */}
                        <div className="grid grid-cols-3 gap-2">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                                title="Toggle theme"
                            >
                                {darkMode ? (
                                    <SunIcon className="w-5 h-5 text-yellow-500 mb-1 group-hover:scale-110 transition-transform" />
                                ) : (
                                    <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1 group-hover:scale-110 transition-transform" />
                                )}
                                <span className="text-xs text-gray-600 dark:text-gray-400">Theme</span>
                            </button>

                            {/* Notifications */}
                            <div className="flex flex-col items-center justify-center">
                                <NotificationBell position="left" />  {/* Dropdown opens to the left */}
                                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">Notifications</span>
                            </div>

                            {/* Settings */}
                            <NavLink
                                to="/settings"
                                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                            >
                                <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1 group-hover:scale-110 transition-transform" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Settings</span>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-72">
                <main className="min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 dark:text-gray-200">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default Layout