import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface ProgressItem {
    label: string;
    value: number;
    maxValue: number;
    color?: string;
    showPercentage?: boolean;
}

interface ProgressChartProps {
    data: ProgressItem[];
    title?: string;
    className?: string;
    showCard?: boolean;
    orientation?: 'horizontal' | 'vertical';
}

const ProgressChart: React.FC<ProgressChartProps> = ({
    data,
    title,
    className = '',
    showCard = true,
    orientation = 'horizontal'
}) => {
    if (!data || data.length === 0) {
        const emptyContent = (
            <div className="flex items-center justify-center h-32">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No progress data available</p>
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

    const chartContent = (
        <div className="space-y-4">
            {data.map((item, index) => {
                const percentage = (item.value / item.maxValue) * 100;
                const displayPercentage = item.showPercentage !== false;

                return (
                    <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>{item.value}</span>
                                <span className="text-gray-400">/</span>
                                <span>{item.maxValue}</span>
                                {displayPercentage && (
                                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                                )}
                            </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="h-2.5 rounded-full transition-all duration-500 ease-out"
                                style={{
                                    width: `${Math.min(percentage, 100)}%`,
                                    backgroundColor: item.color || '#3B82F6'
                                }}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    if (!showCard) return chartContent;

    return (
        <Card className={className}>
            {title && (
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent>{chartContent}</CardContent>
        </Card>
    );
};

export default ProgressChart;