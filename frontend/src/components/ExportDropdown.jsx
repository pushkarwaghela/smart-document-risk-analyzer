import React, { useState } from 'react';
import {
    DocumentArrowDownIcon,
    TableCellsIcon,
    CodeBracketIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ExportDropdown = ({ onExport }) => {
    const [isOpen, setIsOpen] = useState(false);

    const exportOptions = [
        {
            name: 'PDF Report',
            icon: DocumentTextIcon,
            format: 'pdf',
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            description: 'Full report with charts'
        },
        {
            name: 'Excel Spreadsheet',
            icon: TableCellsIcon,
            format: 'excel',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            description: 'Data tables for analysis'
        },
        {
            name: 'CSV Data',
            icon: DocumentArrowDownIcon,
            format: 'csv',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            description: 'Raw data in CSV format'
        },
        {
            name: 'JSON Export',
            icon: CodeBracketIcon,
            format: 'json',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            description: 'Complete data as JSON'
        },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-secondary flex items-center space-x-2"
            >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Export</span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close on click outside */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Export Options</h3>
                        </div>
                        <div className="p-2">
                            {exportOptions.map((option) => (
                                <button
                                    key={option.format}
                                    onClick={() => {
                                        onExport(option.format);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                >
                                    <div className={`w-8 h-8 ${option.bgColor} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                                        <option.icon className={`w-4 h-4 ${option.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{option.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ExportDropdown;