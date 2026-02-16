import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const AIPanel = ({ documents, risks }) => {
    const totalDocs = documents?.length || 0;
    const totalRisks = risks?.length || 0;

    const insights = [
        {
            title: 'Risk Density',
            value: totalDocs ? (totalRisks / totalDocs).toFixed(2) : 0,
            trend: '+5%',
            icon: ChartBarIcon,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            title: 'Critical Risk %',
            value: totalRisks ? `${((risks?.filter(r => r.risk_level === 'CRITICAL').length / totalRisks) * 100).toFixed(1)}%` : '0%',
            trend: '-2%',
            icon: SparklesIcon,
            color: 'from-purple-500 to-pink-500',
        },
        {
            title: 'AI Confidence',
            value: '94%',
            trend: '+3%',
            icon: LightBulbIcon,
            color: 'from-green-500 to-emerald-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {insights.map((insight, index) => (
                <motion.div
                    key={insight.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 border border-gray-200 dark:border-gray-700"
                >
                    <div className={`absolute inset-0 bg-gradient-to-r ${insight.color} opacity-5`} />

                    <div className="relative flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{insight.title}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{insight.value}</p>
                            <p className="text-xs text-green-600 mt-1">{insight.trend} vs last week</p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${insight.color} flex items-center justify-center`}>
                            <insight.icon className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default AIPanel;