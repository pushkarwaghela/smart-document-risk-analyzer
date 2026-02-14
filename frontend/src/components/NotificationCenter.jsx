import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const { token } = useSelector(state => state.auth);

    useEffect(() => {
        // Load notifications from localStorage
        const saved = localStorage.getItem('notifications');
        if (saved) {
            setNotifications(JSON.parse(saved));
        }

        // Check for document processing updates every 10 seconds
        const interval = setInterval(checkDocumentStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const checkDocumentStatus = async () => {
        // This would check for completed documents
        // For now, using mock data
        const newNotification = {
            id: Date.now(),
            title: 'Document Processing Complete',
            message: 'Your document has been analyzed successfully',
            type: 'success',
            timestamp: new Date().toISOString(),
            read: false
        };

        addNotification(newNotification);
    };

    const addNotification = (notification) => {
        setNotifications(prev => {
            const updated = [notification, ...prev].slice(0, 20);
            localStorage.setItem('notifications', JSON.stringify(updated));
            return updated;
        });
    };

    const markAsRead = (id) => {
        setNotifications(prev => {
            const updated = prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
            localStorage.setItem('notifications', JSON.stringify(updated));
            return updated;
        });
    };

    const clearAll = () => {
        setNotifications([]);
        localStorage.removeItem('notifications');
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
            >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            <button
                                onClick={clearAll}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Clear all
                            </button>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <BellIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${notification.read ? 'opacity-75' : ''
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start">
                                        {notification.type === 'success' ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                                        ) : (
                                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 mr-3" />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(notification.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;