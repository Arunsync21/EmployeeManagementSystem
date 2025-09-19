// Enums matching .NET backend (using const assertions for erasableSyntaxOnly compatibility)
export const Gender = {
    Male: 'Male',
    Female: 'Female',
    Other: 'Other'
} as const;
export type Gender = typeof Gender[keyof typeof Gender];

export const EmploymentType = {
    FullTime: 'FullTime',
    PartTime: 'PartTime',
    Contract: 'Contract',
    Intern: 'Intern'
} as const;
export type EmploymentType = typeof EmploymentType[keyof typeof EmploymentType];

export const EmploymentStatus = {
    Active: 'Active',
    Inactive: 'Inactive',
    Terminated: 'Terminated',
    OnLeave: 'OnLeave'
} as const;
export type EmploymentStatus = typeof EmploymentStatus[keyof typeof EmploymentStatus];

export const AttendanceStatus = {
    Present: 'Present',
    Absent: 'Absent',
    Late: 'Late',
    HalfDay: 'HalfDay',
    Holiday: 'Holiday',
    Leave: 'Leave'
} as const;
export type AttendanceStatus = typeof AttendanceStatus[keyof typeof AttendanceStatus];

export const UserRole = {
    Admin: 'Admin',
    HR: 'HR',
    Manager: 'Manager',
    Employee: 'Employee'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const PayrunStatus = {
    Draft: 'Draft',
    Posted: 'Posted',
    Reversed: 'Reversed'
} as const;
export type PayrunStatus = typeof PayrunStatus[keyof typeof PayrunStatus];

// Base interface for auditable entities
export interface AuditableEntity {
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string;
    createdBy?: number;
    updatedBy?: number;
}

// Main entity interfaces
export interface Employee extends AuditableEntity {
    employeeId: number;
    employeeCode: string;

    // Personal
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: Gender;

    // Address
    address?: string;
    city?: string;
    state?: string;
    country?: string;

    // Employment
    departmentId: number;
    department?: Department;
    position: string;
    managerId?: number;
    manager?: Employee;
    subordinates?: Employee[];
    employmentType: EmploymentType;
    employmentStatus: EmploymentStatus;
    hireDate: string;
    terminationDate?: string;
    currentSalary?: number;
    currency: string;

    // Emergency Contact
    emergencyContactName?: string;
    emergencyContactPhone?: string;

    // Navigation properties
    attendances?: Attendance[];
    salaries?: EmployeeSalary[];
    payrunItems?: PayrunItem[];
    performanceReviews?: EmployeePerformance[];
    authUser?: AuthUser;
}

export interface Department extends AuditableEntity {
    departmentId: number;
    name: string;
    code: string;
    employees?: Employee[];
}

export interface DepartmentDto {
    departmentId: number;
    name: string;
    code: string;
    isActive: boolean;
    createdAt: Date;
    employeeCount: number;
    managerName?: string;
}

export interface Attendance extends AuditableEntity {
    attendanceId: number;
    employeeId: number;
    employee?: Employee;
    attendanceDate: string;
    checkInTime?: string;
    checkOutTime?: string;
    totalHours?: number;
    status: AttendanceStatus;
}

export interface AuthUser extends AuditableEntity {
    userId: number;
    username: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    employeeId?: number;
    employee?: Employee;
    lastLoginAt?: string;
    approvedSalaries?: EmployeeSalary[];
    reviewsGiven?: EmployeePerformance[];
}

export interface EmployeePerformance extends AuditableEntity {
    performanceId: number;
    employeeId: number;
    employee?: Employee;
    reviewDate: string;
    rating?: number;
    goals?: string;
    achievements?: string;
    comments?: string;
    reviewedBy?: number;
    reviewer?: AuthUser;
}

export interface EmployeeSalary extends AuditableEntity {
    employeeSalaryId: number;
    employeeId: number;
    employee?: Employee;
    effectiveFrom: string;
    effectiveTo?: string;
    totalCTC: number;
    componentsJson?: string;
    components?: any; // JsonDocument equivalent
    approvedBy?: number;
    approvedByUser?: AuthUser;
}

export interface Payrun extends AuditableEntity {
    payrunId: number;
    payrunName?: string;
    periodStart: string;
    periodEnd: string;
    status: PayrunStatus;
    totalAmount: number;
    items?: PayrunItem[];
}

export interface PayrunItem {
    payrunItemId: number;
    payrunId: number;
    payrun?: Payrun;
    employeeId: number;
    employee?: Employee;
    grossAmount: number;
    netAmount: number;
    componentsJson?: string;
    components?: any; // JsonDocument equivalent
    createdAt: string;
    createdBy?: number;
}

// DTOs for API requests/responses
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
    expiresAt: string;
}

export interface CreateEmployeeRequest {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: Gender;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    departmentId: number;
    position: string;
    role: UserRole;
    employmentType: EmploymentType;
    employmentStatus: EmploymentStatus;
    hireDate: string;
    currentSalary?: number;
    currency?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    createdBy?: number;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
    employeeId: number;
}

export interface CreateDepartmentRequest {
    name: string;
    code: string;
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
    departmentId: number;
}

export interface CreateAttendanceRequest {
    employeeId: number;
    attendanceDate: string;
    checkInTime?: string;
    checkOutTime?: string;
    status: AttendanceStatus;
}

export interface UpdateAttendanceRequest extends Partial<CreateAttendanceRequest> {
    attendanceId: number;
}

export interface ReportFilter {
    startDate?: string;
    endDate?: string;
    departmentId?: number;
    employmentStatus?: EmploymentStatus;
    employeeId?: number;
}

// Legacy interfaces for backward compatibility (will be removed)
export interface User {
    id: string;
    username: string;
    email: string;
    role: 'Admin' | 'HR' | 'Manager';
    firstName: string;
    lastName: string;
}

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: string;
    checkIn: string;
    checkOut?: string;
    status: 'Present' | 'Absent' | 'Late' | 'Half Day';
    hoursWorked?: number;
}