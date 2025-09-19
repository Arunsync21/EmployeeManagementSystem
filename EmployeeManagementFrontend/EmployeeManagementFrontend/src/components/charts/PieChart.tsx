import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface PieChartData {
    label: string;
    value: number;
    color: string;
}

interface PieChartProps {
    data: PieChartData[];
    title?: string;
    size?: number;
    className?: string;
    showCard?: boolean;
    showLegend?: boolean;
    donut?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
    data,
    title,
    size = 280,
    className = '',
    showCard = true,
    showLegend = true,
    donut = false
}) => {
    const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

    if (!data || data.length === 0) {
        const emptyContent = (
            <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
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

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = (size - 60) / 2;
    const innerRadius = donut ? radius * 0.6 : 0;
    const centerX = size / 2;
    const centerY = size / 2;

    let currentAngle = -90; // Start from top

    const slices = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (item.value / total) * 360;

        const startAngle = (currentAngle * Math.PI) / 180;
        const endAngle = ((currentAngle + angle) * Math.PI) / 180;

        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);

        const largeArcFlag = angle > 180 ? 1 : 0;

        let pathData;
        if (donut) {
            const innerX1 = centerX + innerRadius * Math.cos(startAngle);
            const innerY1 = centerY + innerRadius * Math.sin(startAngle);
            const innerX2 = centerX + innerRadius * Math.cos(endAngle);
            const innerY2 = centerY + innerRadius * Math.sin(endAngle);

            pathData = [
                `M ${innerX1} ${innerY1}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${innerX2} ${innerY2}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
                'Z'
            ].join(' ');
        } else {
            pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');
        }

        currentAngle += angle;

        return {
            ...item,
            pathData,
            percentage: percentage.toFixed(1),
            index
        };
    });

    const chartContent = (
        <div className={`flex ${showLegend ? 'items-start' : 'items-center justify-center'} gap-6`}>
            <div className="relative">
                <svg width={size} height={size} className="flex-shrink-0">
                    {slices.map((slice, index) => (
                        <path
                            key={index}
                            d={slice.pathData}
                            fill={slice.color}
                            className={`transition-all duration-200 cursor-pointer ${hoveredSlice === index ? 'opacity-90 drop-shadow-lg' : 'hover:opacity-80'
                                }`}
                            stroke="white"
                            strokeWidth="2"
                            onMouseEnter={() => setHoveredSlice(index)}
                            onMouseLeave={() => setHoveredSlice(null)}
                        />
                    ))}
                </svg>

                {/* Center text for donut chart */}
                {donut && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{total}</div>
                            <div className="text-sm text-gray-500">Total</div>
                        </div>
                    </div>
                )}

                {/* Hover tooltip */}
                {hoveredSlice !== null && (
                    <div className="absolute top-2 left-2 bg-gray-900 text-white px-2 py-1 rounded text-sm">
                        {slices[hoveredSlice].label}: {slices[hoveredSlice].value} ({slices[hoveredSlice].percentage}%)
                    </div>
                )}
            </div>

            {showLegend && (
                <div className="space-y-3 min-w-0 flex-1">
                    {slices.map((slice, index) => (
                        <div
                            key={index}
                            className={`flex items-center text-sm cursor-pointer transition-all duration-200 ${hoveredSlice === index ? 'bg-gray-50 rounded px-2 py-1' : ''
                                }`}
                            onMouseEnter={() => setHoveredSlice(index)}
                            onMouseLeave={() => setHoveredSlice(null)}
                        >
                            <div
                                className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                                style={{ backgroundColor: slice.color }}
                            ></div>
                            <span className="text-gray-700 truncate flex-1">{slice.label}</span>
                            <div className="text-right ml-2">
                                <div className="font-medium text-gray-900">{slice.value}</div>
                                <div className="text-xs text-gray-500">({slice.percentage}%)</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (!showCard) return chartContent;

    return (
        <Card className={className}>
            {title && (
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent>{chartContent}</CardContent>
        </Card>
    );
};

export default PieChart;