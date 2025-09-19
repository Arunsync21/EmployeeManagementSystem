import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface AreaChartData {
    label: string;
    value: number;
    secondaryValue?: number;
}

interface AreaChartProps {
    data: AreaChartData[];
    title?: string;
    height?: number;
    primaryColor?: string;
    secondaryColor?: string;
    className?: string;
    showCard?: boolean;
    stacked?: boolean;
}

const AreaChart: React.FC<AreaChartProps> = ({
    data,
    title,
    height = 300,
    primaryColor = '#3B82F6',
    secondaryColor = '#10B981',
    className = '',
    showCard = true,
    stacked = false
}) => {
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    if (!data || data.length === 0) {
        const emptyContent = (
            <div className={`flex items-center justify-center ${className}`} style={{ height }}>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

    const maxPrimary = Math.max(...data.map(d => d.value));
    const maxSecondary = data.some(d => d.secondaryValue) ? Math.max(...data.map(d => d.secondaryValue || 0)) : 0;
    const maxValue = stacked ? Math.max(...data.map(d => d.value + (d.secondaryValue || 0))) : Math.max(maxPrimary, maxSecondary);
    const minValue = 0;
    const range = maxValue - minValue || 1;

    const padding = 50;
    const chartWidth = 90;
    const chartHeight = height - padding * 2;

    // Define the point type explicitly
    type AreaChartPoint = {
        x: number;
        primaryY: number;
        secondaryY: number;
        label: string;
        value: number;
        secondaryValue?: number;
    };

    const points: AreaChartPoint[] = data.map((item, index) => {
        const x = 5 + (index / (data.length - 1)) * chartWidth;
        const primaryY = padding + chartHeight - ((item.value - minValue) / range) * chartHeight;
        const secondaryY = item.secondaryValue
            ? padding + chartHeight - (((stacked ? item.value + item.secondaryValue : item.secondaryValue) - minValue) / range) * chartHeight
            : primaryY;

        return {
            x,
            primaryY,
            secondaryY,
            ...item
        };
    });

    const createAreaPath = (points: AreaChartPoint[], useSecondary = false, stackedBase = false) => {
        if (points.length === 0) return '';

        const yKey = useSecondary ? 'secondaryY' : 'primaryY';
        const baseY = stackedBase ? padding + chartHeight : padding + chartHeight;

        let path = `M ${points[0].x}% ${baseY}`;
        path += ` L ${points[0].x}% ${points[0][yKey]}`;

        for (let i = 1; i < points.length; i++) {
            path += ` L ${points[i].x}% ${points[i][yKey]}`;
        }

        path += ` L ${points[points.length - 1].x}% ${baseY}`;
        path += ' Z';

        return path;
    };

    const chartContent = (
        <div className="w-full">
            <svg width="100%" height={height} className="overflow-visible">
                <defs>
                    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={primaryColor} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={primaryColor} stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.1" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
                    const y = padding + (1 - ratio) * chartHeight;
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
                    const y = padding + (1 - ratio) * chartHeight;
                    const value = Math.round(minValue + range * ratio);
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

                {/* Primary area */}
                <path
                    d={createAreaPath(points)}
                    fill="url(#primaryGradient)"
                    stroke={primaryColor}
                    strokeWidth="2"
                />

                {/* Secondary area */}
                {data.some(d => d.secondaryValue) && (
                    <path
                        d={createAreaPath(points, true)}
                        fill="url(#secondaryGradient)"
                        stroke={secondaryColor}
                        strokeWidth="2"
                    />
                )}

                {/* Data points */}
                {points.map((point, index) => (
                    <g key={index}>
                        {/* Primary point */}
                        <circle
                            cx={`${point.x}%`}
                            cy={point.primaryY}
                            r={hoveredPoint === index ? "5" : "3"}
                            fill={primaryColor}
                            className="transition-all duration-200 cursor-pointer drop-shadow-sm"
                            onMouseEnter={() => setHoveredPoint(index)}
                            onMouseLeave={() => setHoveredPoint(null)}
                        />

                        {/* Secondary point */}
                        {point.secondaryValue && (
                            <circle
                                cx={`${point.x}%`}
                                cy={point.secondaryY}
                                r={hoveredPoint === index ? "5" : "3"}
                                fill={secondaryColor}
                                className="transition-all duration-200 cursor-pointer drop-shadow-sm"
                                onMouseEnter={() => setHoveredPoint(index)}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />
                        )}

                        {/* Tooltip on hover */}
                        {hoveredPoint === index && (
                            <g>
                                <rect
                                    x={`${point.x - 4}%`}
                                    y={Math.min(point.primaryY, point.secondaryY) - 50}
                                    width="8%"
                                    height="40"
                                    fill="rgba(0,0,0,0.8)"
                                    rx="4"
                                />
                                <text
                                    x={`${point.x}%`}
                                    y={Math.min(point.primaryY, point.secondaryY) - 35}
                                    textAnchor="middle"
                                    className="text-xs fill-white font-medium"
                                >
                                    {point.value}
                                </text>
                                {point.secondaryValue && (
                                    <text
                                        x={`${point.x}%`}
                                        y={Math.min(point.primaryY, point.secondaryY) - 20}
                                        textAnchor="middle"
                                        className="text-xs fill-white"
                                    >
                                        {point.secondaryValue}
                                    </text>
                                )}
                            </g>
                        )}

                        {/* X-axis labels */}
                        <text
                            x={`${point.x}%`}
                            y={height - 15}
                            textAnchor="middle"
                            className="text-xs fill-gray-600"
                        >
                            {point.label}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );

    if (!showCard) return chartContent;

    return (
        <Card className={className}>
            {title && (
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent>{chartContent}</CardContent>
        </Card>
    );
};

export default AreaChart;