import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Building2, User, Briefcase } from 'lucide-react';
import { type Employee, type Department, EmploymentStatus, EmploymentType, Gender } from '../../types';
import axiosClient from '../../api/axiosClient';

// Helper functions to convert enum numbers to text
const getGenderText = (gender?: any): string => {
    if (gender === undefined || gender === null) return 'Not specified';
    switch (Number(gender)) {
        case 0: return 'Male';
        case 1: return 'Female';
        case 2: return 'Other';
        default: return 'Not specified';
    }
};

const getEmploymentTypeText = (type?: any): string => {
    switch (Number(type)) {
        case 0: return 'Full Time';
        case 1: return 'Part Time';
        case 2: return 'Contract';
        case 3: return 'Intern';
        default: return 'Unknown';
    }
};

const getEmploymentStatusText = (status?: any): string => {
    switch (Number(status)) {
        case 0: return 'Active';
        case 1: return 'Inactive';
        case 2: return 'Terminated';
        case 3: return 'On Leave';
        default: return 'Unknown';
    }
};

const getEmploymentStatusColor = (status?: any): string => {
    switch (Number(status)) {
        case 0: return 'bg-green-100 text-green-800';
        case 1: return 'bg-gray-100 text-gray-800';
        case 2: return 'bg-red-100 text-red-800';
        case 3: return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const EmployeeDetails: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchEmployee(parseInt(id));
        }
    }, [id]);

    const fetchEmployee = async (employeeId: number) => {
        try {
            setIsLoading(true);
            const response = await axiosClient.get<Employee>(`/employees/${employeeId}`);
            setEmployee(response.data);
        } catch (error) {
            console.error('Error fetching employee:', error);
            setError('Failed to load employee details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading employee details...</span>
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Employee not found</h3>
                <p className="mt-1 text-sm text-gray-500">{error || 'The employee you are looking for does not exist.'}</p>
                <button
                    onClick={() => navigate('/employees')}
                    className="mt-4 btn-primary"
                >
                    Back to Employees
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/employees')}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Back to Employees
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
                </div>
                <button
                    onClick={() => navigate(`/employees/${employee.employeeId}/edit`)}
                    className="btn-primary flex items-center"
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Employee
                </button>
            </div>

            {/* Employee Profile Card */}
            <div className="card">
                <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                        <div className="h-24 w-24 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {employee.firstName} {employee.lastName}
                                </h2>
                                <p className="text-lg text-gray-600">{employee.position}</p>
                                <p className="text-sm text-gray-500">#{employee.employeeCode}</p>
                            </div>
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getEmploymentStatusColor(employee.employmentStatus)}`}>
                                {getEmploymentStatusText(employee.employmentStatus)}
                            </span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-4 h-4 mr-2" />
                                {employee.email}
                            </div>
                            {employee.phoneNumber && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {employee.phoneNumber}
                                </div>
                            )}
                            <div className="flex items-center text-sm text-gray-600">
                                <Building2 className="w-4 h-4 mr-2" />
                                {employee.department?.name || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Full Name:</span>
                            <span className="text-sm text-gray-900">{employee.firstName} {employee.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Email:</span>
                            <span className="text-sm text-gray-900">{employee.email}</span>
                        </div>
                        {employee.phoneNumber && (
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-500">Phone:</span>
                                <span className="text-sm text-gray-900">{employee.phoneNumber}</span>
                            </div>
                        )}
                        {employee.dateOfBirth && (
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-500">Date of Birth:</span>
                                <span className="text-sm text-gray-900">
                                    {new Date(employee.dateOfBirth).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Gender:</span>
                            <span className="text-sm text-gray-900">{getGenderText(employee.gender)}</span>
                        </div>
                    </div>
                </div>

                {/* Employment Information */}
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Employee ID:</span>
                            <span className="text-sm text-gray-900">#{employee.employeeCode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Position:</span>
                            <span className="text-sm text-gray-900">{employee.position}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Department:</span>
                            <span className="text-sm text-gray-900">{employee.department?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Employment Type:</span>
                            <span className="text-sm text-gray-900">{getEmploymentTypeText(employee.employmentType)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Status:</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEmploymentStatusColor(employee.employmentStatus)}`}>
                                {getEmploymentStatusText(employee.employmentStatus)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Hire Date:</span>
                            <span className="text-sm text-gray-900">
                                {new Date(employee.hireDate).toLocaleDateString()}
                            </span>
                        </div>
                        {employee.currentSalary && (
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-500">Salary:</span>
                                <span className="text-sm text-gray-900">
                                    ${employee.currentSalary.toLocaleString()} {employee.currency || 'USD'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Address Information */}
                {(employee.address || employee.city || employee.state || employee.country) && (
                    <div className="card">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                        <div className="space-y-3">
                            {employee.address && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Address:</span>
                                    <span className="text-sm text-gray-900">{employee.address}</span>
                                </div>
                            )}
                            {employee.city && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">City:</span>
                                    <span className="text-sm text-gray-900">{employee.city}</span>
                                </div>
                            )}
                            {employee.state && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">State:</span>
                                    <span className="text-sm text-gray-900">{employee.state}</span>
                                </div>
                            )}
                            {employee.country && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Country:</span>
                                    <span className="text-sm text-gray-900">{employee.country}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Emergency Contact */}
                {(employee.emergencyContactName || employee.emergencyContactPhone) && (
                    <div className="card">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                        <div className="space-y-3">
                            {employee.emergencyContactName && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Name:</span>
                                    <span className="text-sm text-gray-900">{employee.emergencyContactName}</span>
                                </div>
                            )}
                            {employee.emergencyContactPhone && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Phone:</span>
                                    <span className="text-sm text-gray-900">{employee.emergencyContactPhone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDetails;