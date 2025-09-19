import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Area,
    AreaChart
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface RechartsLineChartData {
    name: string;
    value: number;
    secondaryValue?: number;
}

interface RechartsLineChartProps {
    data: RechartsLineChartData[];
    title?: string;
    height?: number;
    primaryColor?: string;
    secondaryColor?: string;
    className?: string;
    showCard?: boolean;
    showLegend?: boolean;
    showArea?: boolean;
    smooth?: boolean;
}

const RechartsLineChart: React.FC<RechartsLineChartProps> = ({
    data,
    title,
    height = 300,
    primaryColor = '#3B82F6',
    secondaryColor = '#10B981',
    className = '',
    showCard = true,
    showLegend = false,
    showArea = false,
    smooth = true
}) => {
    if (!data || data.length === 0) {
        const emptyContent = (
            <div className={`flex items-center justify-center ${className}`} style={{ height }}>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
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

    const ChartComponent = showArea ? AreaChart : LineChart;

    const chartContent = (
        <ResponsiveContainer width="100%" height={height}>
            <ChartComponent data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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

                {showArea ? (
                    <>
                        <Area
                            type={smooth ? "monotone" : "linear"}
                            dataKey="value"
                            stroke={primaryColor}
                            fill={primaryColor}
                            fillOpacity={0.3}
                            strokeWidth={2}
                            name="Primary"
                        />
                        {data.some(d => d.secondaryValue) && (
                            <Area
                                type={smooth ? "monotone" : "linear"}
                                dataKey="secondaryValue"
                                stroke={secondaryColor}
                                fill={secondaryColor}
                                fillOpacity={0.3}
                                strokeWidth={2}
                                name="Secondary"
                            />
                        )}
                    </>
                ) : (
                    <>
                        <Line
                            type={smooth ? "monotone" : "linear"}
                            dataKey="value"
                            stroke={primaryColor}
                            strokeWidth={3}
                            dot={{ fill: primaryColor, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: primaryColor, strokeWidth: 2 }}
                            name="Primary"
                        />
                        {data.some(d => d.secondaryValue) && (
                            <Line
                                type={smooth ? "monotone" : "linear"}
                                dataKey="secondaryValue"
                                stroke={secondaryColor}
                                strokeWidth={3}
                                dot={{ fill: secondaryColor, strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: secondaryColor, strokeWidth: 2 }}
                                name="Secondary"
                            />
                        )}
                    </>
                )}
            </ChartComponent>
        </ResponsiveContainer>
    );

    if (!showCard) return chartContent;

    return (
        <Card className={className}>
            {title && (
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                        </svg>
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent>{chartContent}</CardContent>
        </Card>
    );
};

export default RechartsLineChart;