import React from 'react';
import { SparklesIcon, ChartBarIcon, LightBulbIcon } from '@heroicons/react/24/outline';

const AIPanel = ({ documents, risks }) => {
    const totalDocs = documents?.length || 0;
    const totalRisks = risks?.length || 0;
    const riskDensity = totalDocs ? (totalRisks / totalDocs).toFixed(1) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-primary-100 text-sm">Risk Density</p>
                        <p className="text-2xl font-bold text-white">{riskDensity}</p>
                    </div>
                    <ChartBarIcon className="w-8 h-8 text-white/50" />
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-primary-100 text-sm">AI Confidence</p>
                        <p className="text-2xl font-bold text-white">94%</p>
                    </div>
                    <SparklesIcon className="w-8 h-8 text-white/50" />
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-primary-100 text-sm">Documents</p>
                        <p className="text-2xl font-bold text-white">{totalDocs}</p>
                    </div>
                    <LightBulbIcon className="w-8 h-8 text-white/50" />
                </div>
            </div>
        </div>
    );
};

export default AIPanel;