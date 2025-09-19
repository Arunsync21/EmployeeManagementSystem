import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
    BarChart,
    PieChart,
    LineChart,
    AreaChart,
    DonutChart,
    MetricCard,
    ProgressChart
} from './index';
import { Users, TrendingUp, Activity, Target } from 'lucide-react';

const ChartShowcase: React.FC = () => {
    // Sample data for demonstrations
    const barData = [
        { label: 'Jan', value: 45, color: '#3B82F6' },
        { label: 'Feb', value: 52, color: '#10B981' },
        { label: 'Mar', value: 38, color: '#F59E0B' },
        { label: 'Apr', value: 61, color: '#EF4444' },
        { label: 'May', value: 55, color: '#8B5CF6' },
        { label: 'Jun', value: 67, color: '#06B6D4' }
    ];

    const pieData = [
        { label: 'Engineering', value: 45, color: '#3B82F6' },
        { label: 'Marketing', value: 25, color: '#10B981' },
        { label: 'Sales', value: 20, color: '#F59E0B' },
        { label: 'HR', value: 10, color: '#EF4444' }
    ];

    const lineData = [
        { label: 'Week 1', value: 20 },
        { label: 'Week 2', value: 35 },
        { label: 'Week 3', value: 25 },
        { label: 'Week 4', value: 45 },
        { label: 'Week 5', value: 40 },
        { label: 'Week 6', value: 55 }
    ];

    const areaData = [
        { label: 'Q1', value: 120, secondaryValue: 100 },
        { label: 'Q2', value: 150, secondaryValue: 130 },
        { label: 'Q3', value: 180, secondaryValue: 160 },
        { label: 'Q4', value: 200, secondaryValue: 180 }
    ];

    const progressData = [
        { label: 'Project Alpha', value: 75, maxValue: 100, color: '#3B82F6' },
        { label: 'Project Beta', value: 60, maxValue: 100, color: '#10B981' },
        { label: 'Project Gamma', value: 90, maxValue: 100, color: '#F59E0B' },
        { label: 'Project Delta', value: 45, maxValue: 100, color: '#EF4444' }
    ];

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Chart Components Showcase</h1>
                <p className="text-gray-600">Comprehensive data visualization components for your dashboard</p>
            </div>

            {/* Metric Cards */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Metric Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Users"
                        value="2,543"
                        change="+12%"
                        changeType="increase"
                        icon={Users}
                        trend={[2200, 2300, 2400, 2450, 2500, 2543]}
                    />
                    <MetricCard
                        title="Revenue"
                        value="$45,231"
                        change="+8.2%"
                        changeType="increase"
                        icon={TrendingUp}
                        iconColor="text-green-600"
                    />
                    <MetricCard
                        title="Active Sessions"
                        value="1,234"
                        change="-2.4%"
                        changeType="decrease"
                        icon={Activity}
                        iconColor="text-orange-600"
                    />
                    <MetricCard
                        title="Conversion Rate"
                        value="3.2%"
                        change="0%"
                        changeType="neutral"
                        icon={Target}
                        iconColor="text-purple-600"
                    />
                </div>
            </div>

            {/* Bar and Line Charts */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bar & Line Charts</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BarChart
                        title="Monthly Sales"
                        data={barData}
                        height={300}
                        gradient={true}
                    />
                    <LineChart
                        title="Weekly Performance"
                        data={lineData}
                        height={300}
                        color="#10B981"
                        gradient={true}
                        smooth={true}
                    />
                </div>
            </div>

            {/* Pie and Donut Charts */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pie & Donut Charts</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PieChart
                        title="Department Distribution"
                        data={pieData}
                        size={300}
                    />
                    <DonutChart
                        title="Team Composition"
                        data={pieData}
                        size={300}
                        centerText="100"
                        centerSubtext="Total Members"
                    />
                </div>
            </div>

            {/* Area and Progress Charts */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Area & Progress Charts</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AreaChart
                        title="Quarterly Growth"
                        data={areaData}
                        height={300}
                        primaryColor="#3B82F6"
                        secondaryColor="#10B981"
                    />
                    <ProgressChart
                        title="Project Progress"
                        data={progressData}
                    />
                </div>
            </div>

            {/* Chart Variations */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Chart Variations</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <BarChart
                        title="Compact Bar Chart"
                        data={barData.slice(0, 4)}
                        height={200}
                        showCard={true}
                    />
                    <LineChart
                        title="Simple Line Chart"
                        data={lineData.slice(0, 4)}
                        height={200}
                        color="#8B5CF6"
                    />
                    <DonutChart
                        title="Mini Donut"
                        data={pieData.slice(0, 3)}
                        size={200}
                        showLegend={false}
                    />
                </div>
            </div>

            {/* Usage Examples */}
            <Card>
                <CardHeader>
                    <CardTitle>Usage Examples</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Basic Bar Chart</h4>
                            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                {`<BarChart
  title="Monthly Sales"
  data={[
    { label: 'Jan', value: 45, color: '#3B82F6' },
    { label: 'Feb', value: 52, color: '#10B981' }
  ]}
  height={300}
  gradient={true}
/>`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Metric Card with Trend</h4>
                            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                {`<MetricCard
  title="Total Users"
  value="2,543"
  change="+12%"
  changeType="increase"
  icon={Users}
  trend={[2200, 2300, 2400, 2450, 2500, 2543]}
/>`}
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChartShowcase;