import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchNotifications, markAsRead, markAllAsRead } from '../store/slices/notificationSlice'
import { formatDistanceToNow } from 'date-fns'
import {
    BellIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    ClockIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline'

const NotificationsPage = () => {
    const dispatch = useDispatch()
    const { items, unreadCount, loading } = useSelector((state) => state.notifications)

    useEffect(() => {
        dispatch(fetchNotifications())
    }, [dispatch])

    const getIcon = (type) => {
        switch (type) {
            case 'COMPLETED':
                return <CheckCircleIcon className="w-6 h-6 text-green-500" />
            case 'FAILED':
                return <XMarkIcon className="w-6 h-6 text-red-500" />
            case 'RISK_ALERT':
                return <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
            default:
                return <ClockIcon className="w-6 h-6 text-blue-500" />
        }
    }

    const handleMarkAllRead = () => {
        dispatch(markAllAsRead())
    }

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            dispatch(markAsRead(notification.id))
        }
        // Navigate to related content if URL exists
        if (notification.content_object_url) {
            window.location.href = notification.content_object_url
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <BellIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-lg">No notifications yet</p>
                        <p className="text-sm mt-2">When you get notifications, they'll appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {items.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                                    !notification.is_read ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''
                                }`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        {getIcon(notification.notification_type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className={`text-lg font-semibold ${
                                                !notification.is_read 
                                                    ? 'text-gray-900 dark:text-white' 
                                                    : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-sm text-gray-500 dark:text-gray-500">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                                            {notification.message}
                                        </p>
                                        {notification.content_object_url && (
                                            <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">
                                                Click to view →
                                            </p>
                                        )}
                                    </div>
                                    {!notification.is_read && (
                                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default NotificationsPage