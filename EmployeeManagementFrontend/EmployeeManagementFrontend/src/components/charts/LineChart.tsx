import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface LineChartData {
    label: string;
    value: number;
}

interface LineChartProps {
    data: LineChartData[];
    title?: string;
    height?: number;
    color?: string;
    className?: string;
    showCard?: boolean;
    gradient?: boolean;
    smooth?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
    data,
    title,
    height = 300,
    color = '#3B82F6',
    className = '',
    showCard = true,
    gradient = false,
    smooth = false
}) => {
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    if (!data || data.length === 0) {
        const emptyContent = (
            <div className={`flex items-center justify-center ${className}`} style={{ height }}>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
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
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    const padding = 50;
    const chartWidth = 90;
    const chartHeight = height - padding * 2;

    // Define the point type explicitly
    type ChartPoint = {
        x: number;
        y: number;
        label: string;
        value: number;
    };

    const points: ChartPoint[] = data.map((item, index) => {
        const x = 5 + (index / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((item.value - minValue) / range) * chartHeight;
        return { x, y, ...item };
    });

    // Create smooth curve using cubic bezier
    const createSmoothPath = (points: ChartPoint[]) => {
        if (points.length < 2) return '';

        let path = `M ${points[0].x}% ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];

            if (smooth && i > 1) {
                const prevPrev = points[i - 2];
                const next = points[i + 1] || curr;

                const cp1x = prev.x + (curr.x - prevPrev.x) * 0.15;
                const cp1y = prev.y + (curr.y - prevPrev.y) * 0.15;
                const cp2x = curr.x - (next.x - prev.x) * 0.15;
                const cp2y = curr.y - (next.y - prev.y) * 0.15;

                path += ` C ${cp1x}% ${cp1y}, ${cp2x}% ${cp2y}, ${curr.x}% ${curr.y}`;
            } else {
                path += ` L ${curr.x}% ${curr.y}`;
            }
        }

        return path;
    };

    const pathData = createSmoothPath(points);

    const chartContent = (
        <div className="w-full">
            <svg width="100%" height={height} className="overflow-visible">
                {gradient && (
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                        </linearGradient>
                        <linearGradient id="lineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={color} />
                            <stop offset="100%" stopColor={color} stopOpacity="0.8" />
                        </linearGradient>
                    </defs>
                )}

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

                {/* Area fill for gradient */}
                {gradient && (
                    <path
                        d={`${pathData} L ${points[points.length - 1].x}% ${padding + chartHeight} L ${points[0].x}% ${padding + chartHeight} Z`}
                        fill="url(#lineGradient)"
                    />
                )}

                {/* Line */}
                <path
                    d={pathData}
                    fill="none"
                    stroke={gradient ? "url(#lineStroke)" : color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                />

                {/* Data points */}
                {points.map((point, index) => (
                    <g key={index}>
                        <circle
                            cx={`${point.x}%`}
                            cy={point.y}
                            r={hoveredPoint === index ? "6" : "4"}
                            fill="white"
                            stroke={color}
                            strokeWidth="3"
                            className="transition-all duration-200 cursor-pointer drop-shadow-sm"
                            onMouseEnter={() => setHoveredPoint(index)}
                            onMouseLeave={() => setHoveredPoint(null)}
                        />

                        {/* Value labels on hover */}
                        {hoveredPoint === index && (
                            <>
                                <rect
                                    x={`${point.x - 3}%`}
                                    y={point.y - 35}
                                    width="6%"
                                    height="25"
                                    fill="rgba(0,0,0,0.8)"
                                    rx="4"
                                />
                                <text
                                    x={`${point.x}%`}
                                    y={point.y - 20}
                                    textAnchor="middle"
                                    className="text-xs fill-white font-medium"
                                >
                                    {point.value}
                                </text>
                            </>
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
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent>{chartContent}</CardContent>
        </Card>
    );
};

export default LineChart;