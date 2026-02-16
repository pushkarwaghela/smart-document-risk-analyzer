import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
    BellIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    ClockIcon,
} from '@heroicons/react/24/outline'
import { fetchNotifications, markAsRead, markAllAsRead } from '../store/slices/notificationSlice'
import { formatDistanceToNow } from 'date-fns'

const NotificationBell = ({ position = 'right' }) => {
    const dispatch = useDispatch()
    const { items, unreadCount, loading } = useSelector((state) => state.notifications)
    const [isOpen, setIsOpen] = useState(false)
    const [openUpward, setOpenUpward] = useState(false)
    const buttonRef = useRef(null)
    const dropdownRef = useRef(null)
    const pollingIntervalRef = useRef(null)

    // Initial fetch
    useEffect(() => {
        dispatch(fetchNotifications())
    }, [dispatch])

    // Set up polling only when component is visible
    useEffect(() => {
        // Start polling when component mounts
        startPolling();

        // Cleanup on unmount
        return () => {
            stopPolling();
        };
    }, []);

    const startPolling = () => {
        // Clear any existing interval
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Set new interval - increased to 60 seconds to reduce calls
        pollingIntervalRef.current = setInterval(() => {
            // Only fetch if document is visible (user is on the tab)
            if (!document.hidden) {
                dispatch(fetchNotifications());
            }
        }, 60000); // 60 seconds instead of 30
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    // Handle page visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                // Fetch immediately when user returns
                dispatch(fetchNotifications());
                startPolling();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Check if dropdown should open upward
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect()
            const viewportHeight = window.innerHeight
            const dropdownHeight = 500

            const spaceBelow = viewportHeight - buttonRect.bottom
            const shouldOpenUpward = spaceBelow < dropdownHeight && buttonRect.top > dropdownHeight

            setOpenUpward(shouldOpenUpward)
        }
    }, [isOpen])

    const getIcon = (type) => {
        switch (type) {
            case 'COMPLETED':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />
            case 'FAILED':
                return <XMarkIcon className="w-5 h-5 text-red-500" />
            case 'RISK_ALERT':
                return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
            default:
                return <ClockIcon className="w-5 h-5 text-blue-500" />
        }
    }

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            dispatch(markAsRead(notification.id))
        }
        setIsOpen(false)
    }

    const handleMarkAllRead = () => {
        dispatch(markAllAsRead())
    }

    const getHorizontalPosition = () => {
        switch (position) {
            case 'left':
                return 'left-0'
            case 'right':
                return 'right-0'
            case 'center':
                return 'left-1/2 transform -translate-x-1/2'
            default:
                return 'right-0'
        }
    }

    const getVerticalPosition = () => {
        return openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className={`absolute ${getHorizontalPosition()} ${getVerticalPosition()} w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden`}
                    style={{ maxHeight: '80vh' }}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <BellIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            items.map((notification) => (
                                <Link
                                    key={notification.id}
                                    to={notification.content_object?.url || '#'}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`block p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.is_read ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            {getIcon(notification.notification_type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${!notification.is_read
                                                    ? 'text-gray-900 dark:text-white'
                                                    : 'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                        <Link
                            to="/notifications"
                            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                            onClick={() => setIsOpen(false)}
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationBell