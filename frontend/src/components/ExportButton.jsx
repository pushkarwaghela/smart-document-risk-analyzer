import React, { useState } from 'react'
import { ArrowDownTrayIcon, DocumentArrowDownIcon, TableCellsIcon, CodeBracketIcon } from '@heroicons/react/24/outline'
import { exportToPDF, exportToExcel, exportToCSV } from '../services/exportService'

const ExportButton = ({ document, risks, documents, type = 'single' }) => {
    const [isOpen, setIsOpen] = useState(false)

    const exportOptions = [
        {
            name: 'PDF Report',
            icon: DocumentArrowDownIcon,
            action: () => exportToPDF(document, risks),
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            name: 'Excel Spreadsheet',
            icon: TableCellsIcon,
            action: () => exportToExcel(documents || [document], risks),
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            name: 'CSV Data',
            icon: CodeBracketIcon,
            action: () => {
                const data = risks.map(r => ({
                    Document: document.title,
                    Category: r.category_display,
                    Risk_Level: r.risk_level,
                    Clause: r.clause_text,
                    Explanation: r.explanation
                }))
                exportToCSV(data, `${document.title}_risks.csv`)
            },
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        }
    ]

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
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    {exportOptions.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                option.action()
                                setIsOpen(false)
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
                        >
                            <div className={`w-8 h-8 ${option.bgColor} rounded-lg flex items-center justify-center`}>
                                <option.icon className={`w-4 h-4 ${option.color}`} />
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{option.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ExportButton