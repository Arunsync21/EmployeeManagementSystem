import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface DonutChartData {
    label: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data: DonutChartData[];
    title?: string;
    size?: number;
    className?: string;
    showCard?: boolean;
    centerText?: string;
    centerSubtext?: string;
    showLegend?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({
    data,
    title,
    size = 240,
    className = '',
    showCard = true,
    centerText,
    centerSubtext
}) => {
    const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

    if (!data || data.length === 0) {
        const emptyContent = (
            <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="4" />
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
    const innerRadius = radius * 0.6;
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

        const innerX1 = centerX + innerRadius * Math.cos(startAngle);
        const innerY1 = centerY + innerRadius * Math.sin(startAngle);
        const innerX2 = centerX + innerRadius * Math.cos(endAngle);
        const innerY2 = centerY + innerRadius * Math.sin(endAngle);

        const largeArcFlag = angle > 180 ? 1 : 0;

        const pathData = [
            `M ${innerX1} ${innerY1}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${innerX2} ${innerY2}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
            'Z'
        ].join(' ');

        // Calculate label position
        const labelAngle = startAngle + (endAngle - startAngle) / 2;
        const labelRadius = radius + 20;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);

        currentAngle += angle;

        return {
            ...item,
            pathData,
            percentage: percentage.toFixed(1),
            labelX,
            labelY,
            index
        };
    });

    const chartContent = (
        <div className="flex flex-col items-center">
            <div className="relative">
                <svg width={size} height={size} className="overflow-visible">
                    {slices.map((slice, index) => (
                        <g key={index}>
                            <path
                                d={slice.pathData}
                                fill={slice.color}
                                className={`transition-all duration-300 cursor-pointer ${hoveredSlice === index
                                    ? 'opacity-90 drop-shadow-lg transform scale-105'
                                    : 'hover:opacity-80'
                                    }`}
                                stroke="white"
                                strokeWidth="3"
                                onMouseEnter={() => setHoveredSlice(index)}
                                onMouseLeave={() => setHoveredSlice(null)}
                                style={{
                                    transformOrigin: `${centerX}px ${centerY}px`
                                }}
                            />

                            {/* External labels */}
                            {Number(slice.percentage) > 5 && (
                                <text
                                    x={slice.labelX}
                                    y={slice.labelY}
                                    textAnchor="middle"
                                    className="text-xs fill-gray-600 font-medium"
                                >
                                    {slice.percentage}%
                                </text>
                            )}
                        </g>
                    ))}
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {centerText || total}
                        </div>
                        <div className="text-sm text-gray-500">
                            {centerSubtext || 'Total'}
                        </div>
                    </div>
                </div>

                {/* Hover tooltip */}
                {hoveredSlice !== null && (
                    <div className="absolute top-2 left-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
                        <div className="font-medium">{slices[hoveredSlice].label}</div>
                        <div className="text-xs opacity-90">
                            {slices[hoveredSlice].value} ({slices[hoveredSlice].percentage}%)
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm">
                {slices.map((slice, index) => (
                    <div
                        key={index}
                        className={`flex items-center text-sm cursor-pointer transition-all duration-200 p-2 rounded ${hoveredSlice === index ? 'bg-gray-50' : ''
                            }`}
                        onMouseEnter={() => setHoveredSlice(index)}
                        onMouseLeave={() => setHoveredSlice(null)}
                    >
                        <div
                            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                            style={{ backgroundColor: slice.color }}
                        ></div>
                        <span className="text-gray-700 truncate flex-1">{slice.label}</span>
                        <span className="text-gray-500 text-xs ml-1">{slice.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    if (!showCard) return chartContent;

    return (
        <Card className={className}>
            {title && (
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="4" />
                        </svg>
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent>{chartContent}</CardContent>
        </Card>
    );
};

export default DonutChart;