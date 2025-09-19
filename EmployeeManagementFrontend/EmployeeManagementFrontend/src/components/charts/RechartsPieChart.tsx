import React, { useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface RechartsPieChartData {
    name: string;
    value: number;
    color: string;
}

interface RechartsPieChartProps {
    data: RechartsPieChartData[];
    title?: string;
    size?: number;
    className?: string;
    showCard?: boolean;
    showLegend?: boolean;
    donut?: boolean;
    innerRadius?: number;
}

const RechartsPieChart: React.FC<RechartsPieChartProps> = ({
    data,
    title,
    size = 300,
    className = '',
    showCard = true,
    showLegend = true,
    donut = false,
    innerRadius = 60
}) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    if (!data || data.length === 0) {
        const emptyContent = (
            <div className={`flex items-center justify-center ${className}`} style={{ height: size }}>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
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

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{data.name}</p>
                    <p className="text-sm text-gray-600">
                        Count: {data.value}, Percentage: ({((data.value / data.payload.total) * 100).toFixed(1)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    // Add total to each data point for tooltip calculation
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const dataWithTotal = data.map(item => ({ ...item, total }));

    const chartContent = (
        <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={size}>
                <PieChart>
                    <Pie
                        data={dataWithTotal}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomLabel}
                        outerRadius={size / 2 - 40}
                        innerRadius={donut ? innerRadius : 0}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                        onMouseLeave={onPieLeave}
                    >
                        {dataWithTotal.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke={activeIndex === index ? "#fff" : "none"}
                                strokeWidth={activeIndex === index ? 3 : 0}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    {showLegend && (
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry: any) => (
                                <span style={{ color: entry.color }}>{value}</span>
                            )}
                        />
                    )}
                </PieChart>
            </ResponsiveContainer>

            {/* Center text for donut chart */}
            {donut && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{total}</div>
                        <div className="text-sm text-gray-500">Total</div>
                    </div>
                </div>
            )}
        </div>
    );

    if (!showCard) return <div className="relative">{chartContent}</div>;

    return (
        <Card className={className}>
            {title && (
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        </svg>
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent>
                <div className="relative">{chartContent}</div>
            </CardContent>
        </Card>
    );
};

export default RechartsPieChart;