import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const RiskTrendChart = ({ data }) => {
    const chartData = {
        labels: data.map(d => d.date),
        datasets: [
            {
                label: 'Critical Risks',
                data: data.map(d => d.critical),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'High Risks',
                data: data.map(d => d.high),
                borderColor: '#f97316',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Medium Risks',
                data: data.map(d => d.medium),
                borderColor: '#eab308',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Risk Trends Over Time'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return <Line data={chartData} options={options} />;
};

export const RiskRadarChart = ({ categories }) => {
    const data = {
        labels: ['Financial', 'Privacy', 'Legal', 'Subscription'],
        datasets: [
            {
                label: 'Risk Distribution',
                data: [
                    categories.financial || 0,
                    categories.privacy || 0,
                    categories.legal || 0,
                    categories.subscription || 0
                ],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3b82f6',
                borderWidth: 2
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Risk Profile Radar'
            }
        },
        scales: {
            r: {
                beginAtZero: true
            }
        }
    };

    return <Radar data={data} options={options} />;
};

export const ReadabilityGauge = ({ score }) => {
    const getColor = (score) => {
        if (score < 30) return '#ef4444';
        if (score < 60) return '#f97316';
        if (score < 80) return '#eab308';
        return '#22c55e';
    };

    const data = {
        datasets: [
            {
                data: [score, 100 - score],
                backgroundColor: [getColor(score), '#e5e7eb'],
                borderWidth: 0
            }
        ]
    };

    return (
        <div className="text-center">
            <Doughnut
                data={data}
                options={{
                    cutout: '70%',
                    plugins: {
                        tooltip: { enabled: false },
                        legend: { display: false }
                    }
                }}
            />
            <div className="mt-2">
                <span className="text-2xl font-bold" style={{ color: getColor(score) }}>
                    {Math.round(score)}
                </span>
                <span className="text-gray-600 ml-1">/100</span>
                <p className="text-sm text-gray-500">Readability Score</p>
            </div>
        </div>
    );
};