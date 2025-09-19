import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

// Custom SVG Charts
import { BarChart, PieChart, LineChart } from './index';

// Recharts Components
import RechartsBarChart from './RechartsBarChart';
import RechartsLineChart from './RechartsLineChart';
import RechartsPieChart from './RechartsPieChart';

const ChartComparison: React.FC = () => {
    // Sample data
    const barData = [
        { label: 'Jan', value: 45, name: 'Jan' },
        { label: 'Feb', value: 52, name: 'Feb' },
        { label: 'Mar', value: 38, name: 'Mar' },
        { label: 'Apr', value: 61, name: 'Apr' },
        { label: 'May', value: 55, name: 'May' },
        { label: 'Jun', value: 67, name: 'Jun' }
    ];

    const lineData = [
        { label: 'Week 1', value: 20, name: 'Week 1' },
        { label: 'Week 2', value: 35, name: 'Week 2' },
        { label: 'Week 3', value: 25, name: 'Week 3' },
        { label: 'Week 4', value: 45, name: 'Week 4' },
        { label: 'Week 5', value: 40, name: 'Week 5' },
        { label: 'Week 6', value: 55, name: 'Week 6' }
    ];

    const pieData = [
        { label: 'Engineering', value: 45, color: '#3B82F6', name: 'Engineering' },
        { label: 'Marketing', value: 25, color: '#10B981', name: 'Marketing' },
        { label: 'Sales', value: 20, color: '#F59E0B', name: 'Sales' },
        { label: 'HR', value: 10, color: '#EF4444', name: 'HR' }
    ];

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Chart Implementation Comparison</h1>
                <p className="text-gray-600">Custom SVG vs Recharts Library</p>
            </div>

            {/* Comparison Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Feature Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 font-medium">Feature</th>
                                    <th className="text-left p-3 font-medium">Custom SVG</th>
                                    <th className="text-left p-3 font-medium">Recharts</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">Bundle Size</td>
                                    <td className="p-3 text-green-600">✅ Zero dependencies</td>
                                    <td className="p-3 text-orange-600">⚠️ ~200KB added</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">Animations</td>
                                    <td className="p-3 text-orange-600">⚠️ Manual implementation</td>
                                    <td className="p-3 text-green-600">✅ Built-in smooth animations</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">Responsiveness</td>
                                    <td className="p-3 text-orange-600">⚠️ Manual responsive logic</td>
                                    <td className="p-3 text-green-600">✅ Automatic responsive container</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">Tooltips</td>
                                    <td className="p-3 text-orange-600">⚠️ Custom implementation</td>
                                    <td className="p-3 text-green-600">✅ Rich, customizable tooltips</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">Accessibility</td>
                                    <td className="p-3 text-red-600">❌ Manual ARIA implementation</td>
                                    <td className="p-3 text-green-600">✅ Built-in accessibility</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">Development Speed</td>
                                    <td className="p-3 text-red-600">❌ Slower, more code</td>
                                    <td className="p-3 text-green-600">✅ Faster, less code</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">Customization</td>
                                    <td className="p-3 text-green-600">✅ Complete control</td>
                                    <td className="p-3 text-orange-600">⚠️ Limited by library API</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">Performance</td>
                                    <td className="p-3 text-green-600">✅ Lightweight</td>
                                    <td className="p-3 text-orange-600">⚠️ Library overhead</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Bar Chart Comparison */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bar Chart Comparison</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BarChart
                        title="Custom SVG Bar Chart"
                        data={barData.map(d => ({ label: d.label, value: d.value, color: '#3B82F6' }))}
                        height={300}
                        gradient={true}
                    />
                    <RechartsBarChart
                        title="Recharts Bar Chart"
                        data={barData}
                        height={300}
                        primaryColor="#3B82F6"
                    />
                </div>
            </div>

            {/* Line Chart Comparison */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Line Chart Comparison</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <LineChart
                        title="Custom SVG Line Chart"
                        data={lineData}
                        height={300}
                        color="#10B981"
                        gradient={true}
                        smooth={true}
                    />
                    <RechartsLineChart
                        title="Recharts Line Chart"
                        data={lineData}
                        height={300}
                        primaryColor="#10B981"
                        smooth={true}
                    />
                </div>
            </div>

            {/* Pie Chart Comparison */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pie Chart Comparison</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PieChart
                        title="Custom SVG Pie Chart"
                        data={pieData}
                        size={300}
                    />
                    <RechartsPieChart
                        title="Recharts Pie Chart"
                        data={pieData}
                        size={300}
                        showLegend={true}
                    />
                </div>
            </div>

            {/* Advanced Recharts Features */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Recharts Features</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RechartsLineChart
                        title="Area Chart with Recharts"
                        data={lineData.map(d => ({ ...d, secondaryValue: d.value * 0.7 }))}
                        height={300}
                        primaryColor="#8B5CF6"
                        secondaryColor="#EC4899"
                        showArea={true}
                        showLegend={true}
                    />
                    <RechartsPieChart
                        title="Donut Chart with Recharts"
                        data={pieData}
                        size={300}
                        donut={true}
                        showLegend={false}
                    />
                </div>
            </div>

            {/* Code Comparison */}
            <Card>
                <CardHeader>
                    <CardTitle>Code Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Custom SVG (Simplified)</h4>
                            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto h-64">
                                {`// 100+ lines of SVG code
const BarChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = 100 / data.length;
  
  return (
    <svg width="100%" height={height}>
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * chartHeight;
        const x = (index * barWidth) + (barWidth * 0.1);
        const y = height - barHeight - 40;
        
        return (
          <rect
            key={index}
            x={\`\${x}%\`}
            y={y}
            width={\`\${barWidth * 0.8}%\`}
            height={barHeight}
            fill={item.color}
            // ... more props
          />
        );
      })}
      {/* Grid lines, labels, tooltips... */}
    </svg>
  );
};`}
                            </pre>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Recharts (Complete)</h4>
                            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto h-64">
                                {`// Just 20 lines for full functionality
import { BarChart, Bar, XAxis, YAxis, 
         CartesianGrid, Tooltip, ResponsiveContainer } 
from 'recharts';

const RechartsBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar 
        dataKey="value" 
        fill="#3B82F6"
        radius={[4, 4, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
);

// That's it! Full responsive chart with:
// ✅ Animations
// ✅ Tooltips  
// ✅ Responsive design
// ✅ Accessibility
// ✅ Grid lines
// ✅ Axis labels`}
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recommendation */}
            <Card className="border-green-200 bg-green-50">
                <CardHeader>
                    <CardTitle className="text-green-800">Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-green-700">
                        <p className="mb-3">
                            <strong>For most production applications, I recommend Recharts because:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1 mb-4">
                            <li>Significantly faster development time</li>
                            <li>Built-in animations and interactions</li>
                            <li>Better accessibility out of the box</li>
                            <li>Responsive by default</li>
                            <li>Rich tooltip and legend support</li>
                            <li>Battle-tested and maintained</li>
                        </ul>
                        <p>
                            <strong>Use custom SVG only when:</strong> You need very specific customizations that Recharts doesn't support,
                            or when bundle size is extremely critical (mobile-first apps).
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChartComparison;