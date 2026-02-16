import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';  // ✅ ADD THIS IMPORT!
import { PaintBrushIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const ThemeCustomizer = () => {
    const { darkMode, toggleDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const colors = [
        { name: 'Blue', primary: '#3b82f6', secondary: '#8b5cf6' },
        { name: 'Green', primary: '#10b981', secondary: '#34d399' },
        { name: 'Purple', primary: '#8b5cf6', secondary: '#ec4899' },
        { name: 'Orange', primary: '#f97316', secondary: '#f59e0b' },
        { name: 'Red', primary: '#ef4444', secondary: '#f87171' },
    ];

    const setPrimaryColor = (color) => {
        document.documentElement.style.setProperty('--primary-color', color);
        document.documentElement.style.setProperty('--primary-500', color);
        localStorage.setItem('primaryColor', color);
    };

    const setAccentColor = (color) => {
        document.documentElement.style.setProperty('--secondary-color', color);
        document.documentElement.style.setProperty('--secondary-500', color);
        localStorage.setItem('accentColor', color);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center hover:scale-110"
                title="Customize Theme"
            >
                <PaintBrushIcon className="w-6 h-6 text-white" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-20 right-0 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 z-[200]"
                    >
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <PaintBrushIcon className="w-5 h-5 mr-2 text-primary-500" />
                            Customize Theme
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Primary Color
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setPrimaryColor(color.primary)}
                                            className="w-10 h-10 rounded-full hover:scale-110 transition-transform shadow-md"
                                            style={{ backgroundColor: color.primary }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Accent Color
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setAccentColor(color.secondary)}
                                            className="w-10 h-10 rounded-full hover:scale-110 transition-transform shadow-md"
                                            style={{ backgroundColor: color.secondary }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={toggleDarkMode}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                            >
                                Switch to {darkMode ? 'Light' : 'Dark'} Mode
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeCustomizer;