import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface RechartsAreaChartData {
    name: string;
    value: number;
    secondaryValue?: number;
}

interface RechartsAreaChartProps {
    data: RechartsAreaChartData[];
    title?: string;
    height?: number;
    primaryColor?: string;
    secondaryColor?: string;
    className?: string;
    showCard?: boolean;
    showLegend?: boolean;
    stacked?: boolean;
}

const RechartsAreaChart: React.FC<RechartsAreaChartProps> = ({
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

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.dataKey}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const chartContent = (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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

                <Area
                    type="monotone"
                    dataKey="value"
                    stackId={stacked ? "1" : undefined}
                    stroke={primaryColor}
                    fill={primaryColor}
                    fillOpacity={0.6}
                    strokeWidth={2}
                    name="Primary"
                />

                {data.some(d => d.secondaryValue) && (
                    <Area
                        type="monotone"
                        dataKey="secondaryValue"
                        stackId={stacked ? "1" : undefined}
                        stroke={secondaryColor}
                        fill={secondaryColor}
                        fillOpacity={0.6}
                        strokeWidth={2}
                        name="Secondary"
                    />
                )}
            </AreaChart>
        </ResponsiveContainer>
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

export default RechartsAreaChart;