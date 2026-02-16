import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
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
    BellIcon,
    UserIcon,
} from '@heroicons/react/24/outline'

const Layout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useSelector((state) => state.auth)
    const { darkMode, toggleDarkMode } = useTheme()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: HomeIcon,
            description: 'Overview and statistics',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            name: 'Upload Document',
            href: '/upload',
            icon: DocumentArrowUpIcon,
            description: 'Upload new files or paste text',
            color: 'from-purple-500 to-pink-500'
        },
        {
            name: 'My Documents',
            href: '/documents',
            icon: DocumentTextIcon,
            description: 'View and manage documents',
            color: 'from-green-500 to-emerald-500'
        },
        {
            name: 'Analytics',
            href: '/analytics',
            icon: ChartBarIcon,
            description: 'Insights and statistics',
            color: 'from-orange-500 to-red-500'
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Cog6ToothIcon,
            description: 'Account preferences',
            color: 'from-gray-500 to-slate-500'
        },
    ]

    // Desktop sidebar should always be visible - no animation needed
    // Mobile sidebar uses animation

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Mobile Header - Only visible on mobile */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 z-30 px-4 py-3 shadow-lg">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>

                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
                            <ShieldCheckIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="ml-2 font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            Risk Analyzer
                        </span>
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
                        <NotificationBell />
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay - Only on mobile */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar - Different behavior for mobile vs desktop */}
            {/* Desktop: Always visible with transform-none */}
            {/* Mobile: Slides in/out with animation */}
            <aside
                className={`
                    fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 shadow-2xl z-50
                    border-r border-gray-200 dark:border-gray-700
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:transition-none
                `}
            >
                <div className="flex flex-col h-full relative overflow-y-auto">
                    {/* Close Button - Mobile Only */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                    >
                        <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>

                    {/* Logo */}
                    <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
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

                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href
                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) => `
                                        relative flex items-start p-3 rounded-xl transition-all duration-300
                                        ${isActive
                                            ? 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 border border-primary-100 dark:border-primary-800 shadow-md'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                                        }
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className={`
                                                w-10 h-10 rounded-lg flex items-center justify-center mr-3
                                                ${isActive
                                                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                                }
                                            `}>
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`
                                                    text-sm font-semibold
                                                    ${isActive
                                                        ? 'text-gray-900 dark:text-white'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                    }
                                                `}>
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {item.description}
                                                </p>
                                            </div>
                                            {isActive && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            )
                        })}
                    </nav>

                    {/* User Profile Section */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 ml-3">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {user?.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={toggleDarkMode}
                                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                {darkMode ? (
                                    <SunIcon className="w-5 h-5 text-yellow-500 mb-1" />
                                ) : (
                                    <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1" />
                                )}
                                <span className="text-xs text-gray-600 dark:text-gray-400">Theme</span>
                            </button>

                            <NavLink
                                to="/notifications"
                                onClick={() => setSidebarOpen(false)}
                                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Alerts</span>
                            </NavLink>

                            <NavLink
                                to="/profile"
                                onClick={() => setSidebarOpen(false)}
                                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Profile</span>
                            </NavLink>
                        </div>
                    </div>

                    {/* Version Info */}
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            Version 2.0.0 • Premium
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content - With Left Padding for Desktop */}
            <main className="lg:pl-72 pt-16 lg:pt-0">
                <div className="min-h-screen p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Layout