import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface RechartsBarChartData {
    name: string;
    value: number;
    secondaryValue?: number;
}

interface RechartsBarChartProps {
    data: RechartsBarChartData[];
    title?: string;
    height?: number;
    primaryColor?: string;
    secondaryColor?: string;
    className?: string;
    showCard?: boolean;
    showLegend?: boolean;
    stacked?: boolean;
}

const RechartsBarChart: React.FC<RechartsBarChartProps> = ({
    data,
    title,
    height = 300,
    primaryColor = '#3B82F6',
    secondaryColor = '#10B981',
    className = '',
    showCard = true,
    showLegend = false,
    stacked = false
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

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            Employee Count: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const chartContent = (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                <Bar
                    dataKey="value"
                    fill={primaryColor}
                    radius={[4, 4, 0, 0]}
                    name="Primary"
                />
                {data.some(d => d.secondaryValue) && (
                    <Bar
                        dataKey="secondaryValue"
                        fill={secondaryColor}
                        radius={[4, 4, 0, 0]}
                        name="Secondary"
                        stackId={stacked ? "stack" : undefined}
                    />
                )}
            </BarChart>
        </ResponsiveContainer>
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

export default RechartsBarChart;