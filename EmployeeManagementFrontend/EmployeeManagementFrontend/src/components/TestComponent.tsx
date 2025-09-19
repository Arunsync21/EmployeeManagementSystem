import React from 'react';

const TestComponent: React.FC = () => {
    return (
        <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Test Component</h2>
            <p className="text-gray-600 mb-4">This component tests if Tailwind CSS is working correctly.</p>
            <div className="space-x-2">
                <button className="btn-primary">Primary Button</button>
                <button className="btn-secondary">Secondary Button</button>
            </div>
            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Test input field"
                    className="input-field"
                />
            </div>
        </div>
    );
};

export default TestComponent;