import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { type LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'increase' | 'decrease' | 'neutral';
    icon?: LucideIcon;
    iconColor?: string;
    className?: string;
    subtitle?: string;
    trend?: number[];
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    change,
    changeType = 'neutral',
    icon: Icon,
    iconColor = 'text-blue-600',
    className = '',
    subtitle,
    trend
}) => {
    const getChangeColor = () => {
        switch (changeType) {
            case 'increase':
                return 'text-green-600 bg-green-50';
            case 'decrease':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getChangeIcon = () => {
        switch (changeType) {
            case 'increase':
                return (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                    </svg>
                );
            case 'decrease':
                return (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                );
        }
    };

    const renderMiniTrend = () => {
        if (!trend || trend.length < 2) return null;

        const max = Math.max(...trend);
        const min = Math.min(...trend);
        const range = max - min || 1;

        const points = trend.map((value, index) => {
            const x = (index / (trend.length - 1)) * 60;
            const y = 20 - ((value - min) / range) * 15;
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="mt-2">
                <svg width="60" height="20" className="opacity-60">
                    <polyline
                        points={points}
                        fill="none"
                        stroke={changeType === 'increase' ? '#10B981' : changeType === 'decrease' ? '#EF4444' : '#6B7280'}
                        strokeWidth="1.5"
                    />
                </svg>
            </div>
        );
    };

    return (
        <Card className={`hover:shadow-md transition-shadow duration-200 ${className}`}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
                            <p className="text-sm font-medium text-gray-600">{title}</p>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                            {change && (
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getChangeColor()}`}>
                                    {getChangeIcon()}
                                    {change}
                                </span>
                            )}
                        </div>

                        {subtitle && (
                            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                        )}

                        {renderMiniTrend()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default MetricCard;