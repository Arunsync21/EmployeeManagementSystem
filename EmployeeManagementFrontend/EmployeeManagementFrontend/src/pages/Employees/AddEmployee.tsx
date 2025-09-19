import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { type CreateEmployeeRequest, type Employee, type Department, EmploymentType, EmploymentStatus, Gender, UserRole } from '../../types';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';

// Helper functions to convert enum strings to numbers for backend
const getGenderNumber = (gender?: string): number | null => {
    if (!gender) return null;
    switch (gender) {
        case Gender.Male: return 0;
        case Gender.Female: return 1;
        case Gender.Other: return 2;
        default: return null;
    }
};

const getEmploymentTypeNumber = (type: string): number => {
    switch (type) {
        case EmploymentType.FullTime: return 0;
        case EmploymentType.PartTime: return 1;
        case EmploymentType.Contract: return 2;
        case EmploymentType.Intern: return 3;
        default: return 0;
    }
};

const getEmploymentStatusNumber = (status: string): number => {
    switch (status) {
        case EmploymentStatus.Active: return 0;
        case EmploymentStatus.Inactive: return 1;
        case EmploymentStatus.Terminated: return 2;
        case EmploymentStatus.OnLeave: return 3;
        default: return 0;
    }
};

const getUserRoleNumber = (role: string): number => {
    switch (role) {
        case UserRole.Admin: return 0;
        case UserRole.HR: return 1;
        case UserRole.Manager: return 2;
        case UserRole.Employee: return 3;
        default: return 3;
    }
};

const AddEmployee: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const isEditMode = !!id;
    const [formData, setFormData] = useState<CreateEmployeeRequest & { role?: string }>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: undefined,
        address: '',
        city: '',
        state: '',
        country: '',
        departmentId: 0,
        position: '',
        employmentType: EmploymentType.FullTime,
        employmentStatus: EmploymentStatus.Active,
        hireDate: '',
        currentSalary: undefined,
        currency: 'INR',
        emergencyContactName: '',
        emergencyContactPhone: '',
        role: UserRole.Employee
    });

    useEffect(() => {
        fetchDepartments();
        if (isEditMode && id) {
            fetchEmployee(parseInt(id));
        }
    }, [isEditMode, id]);

    const fetchDepartments = async () => {
        try {
            const response = await axiosClient.get<Department[]>('/departments');

            // Handle ASP.NET Core System.Text.Json reference handling format
            let departmentsData: Department[] = [];
            if (response.data && typeof response.data === 'object' && '$values' in response.data) {
                departmentsData = Array.isArray((response.data as any).$values) ? (response.data as any).$values : [];
            } else if (Array.isArray(response.data)) {
                departmentsData = response.data;
            }

            setDepartments(departmentsData);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchEmployee = async (employeeId: number) => {
        setIsLoadingEmployee(true);
        try {
            const response = await axiosClient.get<CreateEmployeeRequest>(`/employees/${employeeId}`);
            const employee = response.data;

            // Convert employee data to form format
            setFormData({
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                phoneNumber: employee.phoneNumber || '',
                dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
                gender: employee.gender !== undefined && employee.gender !== null ?
                    (Number(employee.gender) === 0 ? Gender.Male :
                        Number(employee.gender) === 1 ? Gender.Female : Gender.Other) : undefined,
                address: employee.address || '',
                city: employee.city || '',
                state: employee.state || '',
                country: employee.country || '',
                departmentId: employee.departmentId,
                position: employee.position,
                employmentType: Number(employee.employmentType) === 0 ? EmploymentType.FullTime :
                    Number(employee.employmentType) === 1 ? EmploymentType.PartTime :
                        Number(employee.employmentType) === 2 ? EmploymentType.Contract : EmploymentType.Intern,
                employmentStatus: Number(employee.employmentStatus) === 0 ? EmploymentStatus.Active :
                    Number(employee.employmentStatus) === 1 ? EmploymentStatus.Inactive :
                        Number(employee.employmentStatus) === 2 ? EmploymentStatus.Terminated : EmploymentStatus.OnLeave,
                hireDate: employee.hireDate.split('T')[0], // Convert to YYYY-MM-DD format
                currentSalary: employee.currentSalary,
                currency: employee.currency || 'INR',
                emergencyContactName: employee.emergencyContactName || '',
                emergencyContactPhone: employee.emergencyContactPhone || '',
                role: employee?.role !== undefined && employee?.role !== null ?
                    (Number(employee.role) === 0 ? UserRole.Admin :
                        Number(employee.role) === 1 ? UserRole.HR :
                            Number(employee.role) === 2 ? UserRole.Manager : UserRole.Employee) : UserRole.Employee
            });
        } catch (error) {
            console.error('Error fetching employee:', error);
            alert('Error loading employee data');
            navigate('/employees');
        } finally {
            setIsLoadingEmployee(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Basic validation
        if (!formData.departmentId || formData.departmentId === 0) {
            alert('Please select a department');
            setIsLoading(false);
            return;
        }

        try {
            const employeeDto = {
                employeeId: isEditMode ? parseInt(id!) : 0,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber || null,
                dateOfBirth: formData.dateOfBirth || null,
                gender: getGenderNumber(formData.gender as any),
                address: formData.address || null,
                city: formData.city || null,
                state: formData.state || null,
                country: formData.country || null,
                departmentId: parseInt(formData.departmentId.toString()),
                position: formData.position,
                employmentType: getEmploymentTypeNumber(formData.employmentType),
                employmentStatus: getEmploymentStatusNumber(formData.employmentStatus),
                hireDate: formData.hireDate,
                terminationDate: null,
                currentSalary: formData.currentSalary ? parseFloat(formData.currentSalary.toString()) : null,
                currency: formData.currency || 'INR',
                emergencyContactName: formData.emergencyContactName || null,
                emergencyContactPhone: formData.emergencyContactPhone || null,
                role: getUserRoleNumber(formData.role || UserRole.Employee),
                createdBy: user?.userId // Use this as UpdatedBy for Edit
            };

            console.log(`${isEditMode ? 'Updating' : 'Creating'} employee data:`, employeeDto);
            console.log('Current user:', user);

            if (isEditMode) {
                await axiosClient.put(`/employees/${id}`, employeeDto);
            } else {
                await axiosClient.post('/employees', employeeDto);
            }
            navigate('/employees');
        } catch (error: any) {
            console.error('Error creating employee:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            // Show more detailed error message
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.title ||
                error.response?.data ||
                `Error ${isEditMode ? 'updating' : 'creating'} employee. Please try again.`;

            alert(`Error: ${JSON.stringify(errorMessage)}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingEmployee) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading employee data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/employees')}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    Back to Employees
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* <div>
                            <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700 mb-1">
                                Employee Code *
                            </label>
                            <input
                                type="text"
                                id="employeeCode"
                                name="employeeCode"
                                required
                                value={formData.employeeCode}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter employee code"
                            />
                        </div> */}

                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                First Name *
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter first name"
                            />
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter last name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter email address"
                            />
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={formData.dateOfBirth || ''}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender || ''}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="">Select Gender</option>
                                <option value={Gender.Male}>Male</option>
                                <option value={Gender.Female}>Female</option>
                                <option value={Gender.Other}>Other</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter address"
                            />
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter city"
                            />
                        </div>

                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                State
                            </label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                value={formData.state || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter state"
                            />
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                Country
                            </label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                value={formData.country || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter country"
                            />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Employment Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                                Position *
                            </label>
                            <input
                                type="text"
                                id="position"
                                name="position"
                                required
                                value={formData.position}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter job position"
                            />
                        </div>

                        <div>
                            <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                                Department *
                            </label>
                            <select
                                id="departmentId"
                                name="departmentId"
                                required
                                value={formData.departmentId}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.departmentId} value={dept.departmentId}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
                                Employment Type *
                            </label>
                            <select
                                id="employmentType"
                                name="employmentType"
                                required
                                value={formData.employmentType}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value={EmploymentType.FullTime}>Full Time</option>
                                <option value={EmploymentType.PartTime}>Part Time</option>
                                <option value={EmploymentType.Contract}>Contract</option>
                                <option value={EmploymentType.Intern}>Intern</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                                Employment Status *
                            </label>
                            <select
                                id="employmentStatus"
                                name="employmentStatus"
                                required
                                value={formData.employmentStatus}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value={EmploymentStatus.Active}>Active</option>
                                <option value={EmploymentStatus.Inactive}>Inactive</option>
                                <option value={EmploymentStatus.OnLeave}>On Leave</option>
                                <option value={EmploymentStatus.Terminated}>Terminated</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="currentSalary" className="block text-sm font-medium text-gray-700 mb-1">
                                Current Salary
                            </label>
                            <input
                                type="number"
                                id="currentSalary"
                                name="currentSalary"
                                min="0"
                                step="0.01"
                                value={formData.currentSalary || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter salary amount"
                            />
                        </div>

                        <div>
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                                Currency
                            </label>
                            <select
                                id="currency"
                                name="currency"
                                value={formData.currency || 'INR'}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="INR">INR</option>
                                {/* <option value="USD">USD</option>
                                <option value="EUR">EUR</option> */}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                Role *
                            </label>
                            <select
                                id="role"
                                name="role"
                                required
                                value={formData.role || UserRole.Employee}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value={UserRole.Admin}>Admin</option>
                                <option value={UserRole.HR}>HR</option>
                                <option value={UserRole.Manager}>Manager</option>
                                <option value={UserRole.Employee}>Employee</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Hire Date *
                            </label>
                            <input
                                type="date"
                                id="hireDate"
                                name="hireDate"
                                required
                                value={formData.hireDate}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Emergency Contact</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-1">
                                Emergency Contact Name
                            </label>
                            <input
                                type="text"
                                id="emergencyContactName"
                                name="emergencyContactName"
                                value={formData.emergencyContactName || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter emergency contact name"
                            />
                        </div>

                        <div>
                            <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                Emergency Contact Phone
                            </label>
                            <input
                                type="tel"
                                id="emergencyContactPhone"
                                name="emergencyContactPhone"
                                value={formData.emergencyContactPhone || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter emergency contact phone"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/employees')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary flex items-center"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Saving...' : (isEditMode ? 'Update Employee' : 'Save Employee')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEmployee;