import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandLineIcon } from '@heroicons/react/24/outline';
import { useHotkeys } from 'react-hotkeys-hook';

const KeyboardShortcuts = () => {
    const navigate = useNavigate();
    const [showHelp, setShowHelp] = useState(false);

    useHotkeys('ctrl+d', () => navigate('/dashboard'));
    useHotkeys('ctrl+u', () => navigate('/upload'));
    useHotkeys('ctrl+f', () => navigate('/documents'));
    useHotkeys('ctrl+a', () => navigate('/analytics'));
    useHotkeys('ctrl+s', () => navigate('/settings'));
    useHotkeys('ctrl+h', () => setShowHelp(!showHelp));
    useHotkeys('esc', () => setShowHelp(false));

    const shortcuts = [
        { key: 'Ctrl+D', action: 'Go to Dashboard' },
        { key: 'Ctrl+U', action: 'Upload Document' },
        { key: 'Ctrl+F', action: 'View Documents' },
        { key: 'Ctrl+A', action: 'Open Analytics' },
        { key: 'Ctrl+S', action: 'Settings' },
        { key: 'Ctrl+H', action: 'Show/Hide Shortcuts' },
        { key: 'Esc', action: 'Close Modals' },
    ];

    if (!showHelp) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <CommandLineIcon className="w-6 h-6 text-primary-600" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
                    </div>
                    <button
                        onClick={() => setShowHelp(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {shortcuts.map((shortcut) => (
                        <div key={shortcut.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{shortcut.action}</span>
                            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm font-mono">
                                {shortcut.key}
                            </kbd>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcuts;