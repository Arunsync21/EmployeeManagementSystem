import React, { useState, useEffect } from 'react';
import { Plus, Users, Edit, Trash2, Building2 } from 'lucide-react';
import { type DepartmentDto } from '../../types';
import axiosClient from '../../api/axiosClient';

const Departments: React.FC = () => {
    const [departments, setDepartments] = useState<DepartmentDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setIsLoading(true);
            const response = await axiosClient.get<DepartmentDto[]>('/departments');
            console.log('API Response:', response.data); // Debug log

            // Handle ASP.NET Core System.Text.Json reference handling format
            let departmentsData: DepartmentDto[] = [];
            if (response.data && typeof response.data === 'object' && '$values' in response.data) {
                // Handle $values format from ASP.NET Core
                departmentsData = Array.isArray((response.data as any).$values) ? (response.data as any).$values : [];
            } else if (Array.isArray(response.data)) {
                departmentsData = response.data;
            }

            setDepartments(departmentsData);
            setError(null);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setError('Failed to fetch departments');
            setDepartments([]); // Ensure departments is always an array
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (departmentId: number) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await axiosClient.delete(`/departments/${departmentId}`);
                setDepartments(departments.filter(dept => dept.departmentId !== departmentId));
            } catch (error) {
                console.error('Error deleting department:', error);
                alert('Error deleting department. Please try again.');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading departments</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
                <button
                    onClick={() => {
                        setError(null);
                        setIsLoading(true);
                        fetchDepartments();
                    }}
                    className="mt-4 btn-primary"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Calculate statistics
    const totalDepartments = departments.length;
    const activeDepartments = departments.filter(dept => dept.isActive).length;
    const totalEmployees = departments.reduce((sum, dept) => sum + dept.employeeCount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                <button className="btn-primary flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                </button>
            </div>

            {/* Department Overview Cards */}
            {!isLoading && !error && (
                <div className="card">
                    <div className="flex flex-col sm:flex-row gap-6">
                        {/* Total Departments Card */}
                        <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-primary-600" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <div className="text-2xl font-bold text-gray-900">{totalDepartments}</div>
                                    <div className="text-sm text-gray-600">Total Departments</div>
                                </div>
                            </div>
                        </div>

                        {/* Active Departments Card */}
                        <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <div className="text-2xl font-bold text-gray-900">{activeDepartments}</div>
                                    <div className="text-sm text-gray-600">Active Departments</div>
                                </div>
                            </div>
                        </div>

                        {/* Total Employees Card */}
                        <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <div className="text-2xl font-bold text-gray-900">{totalEmployees}</div>
                                    <div className="text-sm text-gray-600">Total Employees</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((department) => (
                    <div key={department.departmentId} className="card hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {department.name}
                                    </h3>
                                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                        {department.code}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                    {/* <Building2 className="w-4 h-4 mr-1" />
                                    Department ID: {department.departmentId} */}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="text-gray-400 hover:text-gray-600"
                                    title="Edit Department"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(department.departmentId)}
                                    className="text-gray-400 hover:text-red-600"
                                    title="Delete Department"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Employees:</span>
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 text-primary-600 mr-1" />
                                    <span className="font-medium text-gray-900">{department.employeeCount}</span>
                                </div>
                            </div>

                            {department.managerName && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Manager:</span>
                                    <span className="font-medium text-gray-900">{department.managerName}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Status:</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${department.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {department.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Created:</span>
                                <span className="text-gray-900">
                                    {new Date(department.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {departments.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by adding a new department.
                    </p>
                    <button className="mt-4 btn-primary flex items-center mx-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Department
                    </button>
                </div>
            )}


        </div>
    );
};

export default Departments;