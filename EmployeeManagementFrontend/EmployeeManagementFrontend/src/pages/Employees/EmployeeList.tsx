import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye, Users, X } from 'lucide-react';
import { type Employee, type Department, EmploymentStatus } from '../../types';
import axiosClient from '../../api/axiosClient';
import ConfirmDialog from '../../components/ConfirmDialog';

// Helper function to convert enum number to text
const getEmploymentStatusText = (status: any): string => {
    // Handle both string and number values from API
    if (typeof status === 'string') return status;

    // Convert number to enum text
    switch (Number(status)) {
        case 0: return EmploymentStatus.Active;
        case 1: return EmploymentStatus.Inactive;
        case 2: return EmploymentStatus.Terminated;
        case 3: return EmploymentStatus.OnLeave;
        default: return 'Unknown';
    }
};

const getEmploymentStatusColor = (status: any): string => {
    const statusText = getEmploymentStatusText(status);
    switch (statusText) {
        case EmploymentStatus.Active:
            return 'bg-green-100 text-green-800';
        case EmploymentStatus.OnLeave:
            return 'bg-yellow-100 text-yellow-800';
        case EmploymentStatus.Terminated:
            return 'bg-red-100 text-red-800';
        case EmploymentStatus.Inactive:
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const EmployeeList: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showSingleDeleteDialog, setShowSingleDeleteDialog] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
    }, []);

    useEffect(() => {
        filterEmployees();
        // Clear selection when filters change
        setSelectedEmployees([]);
    }, [employees, searchTerm, filterDepartment, filterStatus]);

    const fetchEmployees = async () => {
        try {
            const response = await axiosClient.get<Employee[]>('/employees');
            console.log('Employees API Response:', response.data); // Debug log

            // Handle ASP.NET Core System.Text.Json reference handling format
            let employeesData: Employee[] = [];
            if (response.data && typeof response.data === 'object' && '$values' in response.data) {
                employeesData = Array.isArray((response.data as any).$values) ? (response.data as any).$values : [];
            } else if (Array.isArray(response.data)) {
                employeesData = response.data;
            }

            setEmployees(employeesData);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axiosClient.get<Department[]>('/departments');

            let departmentsData: Department[] = response.data;
            setDepartments(departmentsData);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const filterEmployees = () => {
        let filtered = employees;

        if (searchTerm) {
            filtered = filtered.filter(emp =>
                emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterDepartment) {
            filtered = filtered.filter(emp => emp.departmentId.toString() === filterDepartment);
        }

        if (filterStatus) {
            filtered = filtered.filter(emp => getEmploymentStatusText(emp.employmentStatus) === filterStatus);
        }

        setFilteredEmployees(filtered);
    };

    const handleDelete = (employeeId: number) => {
        setEmployeeToDelete(employeeId);
        setShowSingleDeleteDialog(true);
    };

    const confirmSingleDelete = async () => {
        if (!employeeToDelete) return;

        try {
            setIsDeleting(true);
            await axiosClient.delete(`/employees/${employeeToDelete}`);
            fetchEmployees();
            setSuccessMessage('Employee deleted successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting employee:', error);
            setSuccessMessage('Failed to delete employee. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setIsDeleting(false);
            setShowSingleDeleteDialog(false);
            setEmployeeToDelete(null);
        }
    };

    const handleSelectEmployee = (employeeId: number) => {
        setSelectedEmployees(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    const handleSelectAll = () => {
        if (selectedEmployees.length === filteredEmployees.length) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(filteredEmployees.map(emp => emp.employeeId));
        }
    };

    const handleBulkDelete = () => {
        if (selectedEmployees.length === 0) return;
        setShowBulkDeleteDialog(true);
    };

    const confirmBulkDelete = async () => {
        try {
            setIsDeleting(true);
            // Use the bulk-delete endpoint
            const response = await axiosClient.post('/employees/bulk-delete', selectedEmployees);
            console.log('Bulk delete response:', response.data);

            setSelectedEmployees([]);
            fetchEmployees();

            // Show success message
            if (response.data?.Message) {
                setSuccessMessage(response.data.Message);
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        } catch (error) {
            console.error('Error deleting employees:', error);
            setSuccessMessage('Failed to delete employees. Please try again.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setIsDeleting(false);
            setShowBulkDeleteDialog(false);
        }
    };

    const clearSelection = () => {
        setSelectedEmployees([]);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                    {selectedEmployees.length > 0 && (
                        <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                            <span className="text-sm text-red-700">
                                {selectedEmployees.length} selected
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded text-sm flex items-center"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Delete Selected
                                    </>
                                )}
                            </button>
                            <button
                                onClick={clearSelection}
                                className="text-red-600 hover:text-red-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
                <Link to="/employees/add" className="btn-primary flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Employee
                </Link>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 input-field"
                        />
                    </div>

                    <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="input-field"
                    >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept.departmentId} value={dept.departmentId}>{dept.name}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="input-field"
                    >
                        <option value="">All Status</option>
                        <option value={EmploymentStatus.Active}>Active</option>
                        <option value={EmploymentStatus.Inactive}>Inactive</option>
                        <option value={EmploymentStatus.OnLeave}>On Leave</option>
                        <option value={EmploymentStatus.Terminated}>Terminated</option>
                    </select>
                </div>
            </div>

            {/* Employee Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Position
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hire Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.employeeId} className={`hover:bg-gray-50 ${selectedEmployees.includes(employee.employeeId) ? 'bg-blue-50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.includes(employee.employeeId)}
                                            onChange={() => handleSelectEmployee(employee.employeeId)}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-white">
                                                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {employee.firstName} {employee.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">{employee.email}</div>
                                                <div className="text-xs text-gray-400">#{employee.employeeCode}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {employee.position}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {employee.department?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEmploymentStatusColor(employee.employmentStatus)}`}>
                                            {getEmploymentStatusText(employee.employmentStatus)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(employee.hireDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link
                                                to={`/employees/${employee.employeeId}`}
                                                className="text-primary-600 hover:text-primary-900"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                to={`/employees/${employee.employeeId}/edit`}
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(employee.employeeId)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredEmployees.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || filterDepartment || filterStatus
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Get started by adding a new employee.'
                            }
                        </p>
                    </div>
                )}
            </div>



            {/* Success Message */}
            {successMessage && (
                <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50">
                    {successMessage}
                </div>
            )}

            {/* Bulk Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showBulkDeleteDialog}
                onClose={() => setShowBulkDeleteDialog(false)}
                onConfirm={confirmBulkDelete}
                title="Delete Multiple Employees"
                message={`Are you sure you want to delete ${selectedEmployees.length} employee${selectedEmployees.length > 1 ? 's' : ''}? This action cannot be undone.`}
                confirmText="Delete All"
                cancelText="Cancel"
                type="danger"
                isLoading={isDeleting}
            />

            {/* Single Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showSingleDeleteDialog}
                onClose={() => {
                    setShowSingleDeleteDialog(false);
                    setEmployeeToDelete(null);
                }}
                onConfirm={confirmSingleDelete}
                title="Delete Employee"
                message="Are you sure you want to delete this employee? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default EmployeeList;