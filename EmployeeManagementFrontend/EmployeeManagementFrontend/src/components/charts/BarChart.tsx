import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface BarChartData {
    label: string;
    value: number;
    color?: string;
}

interface BarChartProps {
    data: BarChartData[];
    title?: string;
    height?: number;
    className?: string;
    showCard?: boolean;
    gradient?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
    data,
    title,
    height = 300,
    className = '',
    showCard = true,
    gradient = false
}) => {
    if (!data || data.length === 0) {
        const emptyContent = (
            <div className={`flex items-center justify-center ${className}`} style={{ height }}>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No data available</p>
                </div>
            </div>
        );

        if (!showCard) return emptyContent;

        return (
            <Card className={className}>
                {title && (
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                    </CardHeader>
                )}
                <CardContent>{emptyContent}</CardContent>
            </Card>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = 100 / data.length;
    const chartHeight = height - 80;

    const chartContent = (
        <div className="w-full">
            <svg width="100%" height={height} className="overflow-visible">
                {/* Grid lines */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
                    const y = 40 + (1 - ratio) * chartHeight;
                    return (
                        <line
                            key={ratio}
                            x1="5%"
                            y1={y}
                            x2="95%"
                            y2={y}
                            stroke="#F3F4F6"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                        />
                    );
                })}

                {/* Y-axis labels */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
                    const y = 40 + (1 - ratio) * chartHeight;
                    const value = Math.round(maxValue * ratio);
                    return (
                        <text
                            key={ratio}
                            x="2%"
                            y={y + 4}
                            className="text-xs fill-gray-500"
                            textAnchor="start"
                        >
                            {value}
                        </text>
                    );
                })}

                {data.map((item, index) => {
                    const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
                    const x = 5 + (index * (90 / data.length)) + ((90 / data.length) * 0.1);
                    const y = 40 + chartHeight - barHeight;
                    const barWidthPercent = (90 / data.length) * 0.8;

                    return (
                        <g key={index}>
                            {gradient && (
                                <defs>
                                    <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor={item.color || '#3B82F6'} stopOpacity="0.8" />
                                        <stop offset="100%" stopColor={item.color || '#3B82F6'} stopOpacity="0.3" />
                                    </linearGradient>
                                </defs>
                            )}

                            {/* Bar */}
                            <rect
                                x={`${x}%`}
                                y={y}
                                width={`${barWidthPercent}%`}
                                height={barHeight}
                                fill={gradient ? `url(#gradient-${index})` : (item.color || '#3B82F6')}
                                className="hover:opacity-80 transition-all duration-200 cursor-pointer"
                                rx="4"
                            />

                            {/* Value label */}
                            <text
                                x={`${x + (barWidthPercent / 2)}%`}
                                y={y - 8}
                                textAnchor="middle"
                                className="text-xs fill-gray-700 font-medium"
                            >
                                {item.value}
                            </text>

                            {/* X-axis label */}
                            <text
                                x={`${x + (barWidthPercent / 2)}%`}
                                y={height - 15}
                                textAnchor="middle"
                                className="text-xs fill-gray-600"
                            >
                                {item.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );

    if (!showCard) return chartContent;

    return (
        <Card className={className}>
            {title && (
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent>{chartContent}</CardContent>
        </Card>
    );
};

export default BarChart;