CREATE DATABASE EmployeeManagement;

USE EmployeeManagement;

CREATE TABLE Departments (
    DepartmentId BIGINT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Code VARCHAR(50) NOT NULL UNIQUE,
    ManagerId BIGINT NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    DeletedAt DATETIME NULL,
    CreatedBy BIGINT NULL,
    UpdatedBy BIGINT NULL,
    
    FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
    INDEX idx_deleted_at (DeletedAt)
);

CREATE TABLE Employees (
    EmployeeId BIGINT PRIMARY KEY AUTO_INCREMENT,
    EmployeeCode VARCHAR(50) NOT NULL UNIQUE,
    
    -- Personal Information
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PhoneNumber VARCHAR(20) NULL,
    DateOfBirth DATE NULL,
    Gender ENUM('Male', 'Female', 'Other') NULL,
    
    -- Address
    Address TEXT NULL,
    City VARCHAR(100) NULL,
    State VARCHAR(100) NULL,
    Country VARCHAR(100) NULL,
    
    -- Employment Details
    DepartmentId BIGINT NOT NULL,
    Position VARCHAR(255) NOT NULL,
    ManagerId BIGINT NULL,
    EmploymentType ENUM('FullTime', 'PartTime', 'Contract', 'Intern') DEFAULT 'FullTime',
    EmploymentStatus ENUM('Active', 'Inactive', 'Terminated', 'OnLeave') DEFAULT 'Active',
    HireDate DATE NOT NULL,
    TerminationDate DATE NULL,
    
    -- Salary Information
    CurrentSalary DECIMAL(12,2) NULL,
    Currency VARCHAR(3) DEFAULT 'INR',
    
    -- Emergency Contact
    EmergencyContactName VARCHAR(200) NULL,
    EmergencyContactPhone VARCHAR(20) NULL,
    
    -- Audit Fields
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    DeletedAt DATETIME NULL,
    CreatedBy BIGINT NULL,
    UpdatedBy BIGINT NULL,
    
    FOREIGN KEY (DepartmentId) REFERENCES Departments(DepartmentId),
    FOREIGN KEY (ManagerId) REFERENCES Employees(EmployeeId),
    
    INDEX idx_employee_code (EmployeeCode),
    INDEX idx_email (Email),
    INDEX idx_department (DepartmentId),
    INDEX idx_manager (ManagerId),
    INDEX idx_employment_status (EmploymentStatus),
    INDEX idx_hire_date (HireDate),
    INDEX idx_deleted_at (DeletedAt),
    INDEX idx_full_name (FirstName, LastName)
);

CREATE TABLE Attendance (
    AttendanceId BIGINT PRIMARY KEY AUTO_INCREMENT,
    EmployeeId BIGINT NOT NULL,
    AttendanceDate DATE NOT NULL,
    CheckInTime DATETIME NULL,
    CheckOutTime DATETIME NULL,
    TotalHours DECIMAL(4,2) NULL,
    Status ENUM('Present', 'Absent', 'Late', 'HalfDay', 'Holiday', 'Leave') NOT NULL,
    
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    DeletedAt DATETIME NULL,
    CreatedBy BIGINT NULL,
    UpdatedBy BIGINT NULL,
    
    FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
    UNIQUE KEY unique_employee_date (EmployeeId, AttendanceDate),
    INDEX idx_employee (EmployeeId),
    INDEX idx_attendance_date (AttendanceDate),
    INDEX idx_status (Status),
    INDEX idx_deleted_at (DeletedAt)
);

CREATE TABLE AuthUsers (
    UserId BIGINT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('Admin', 'HR', 'Manager', 'Employee') DEFAULT 'Employee',
    EmployeeId BIGINT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    LastLoginAt DATETIME NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    DeletedAt DATETIME NULL,
    CreatedBy BIGINT NULL,
    UpdatedBy BIGINT NULL,
    
    INDEX idx_username (Username),
    INDEX idx_email (Email),
    INDEX idx_deleted_at (DeletedAt)
);

CREATE TABLE EmployeeSalary (
    EmployeeSalaryId BIGINT PRIMARY KEY AUTO_INCREMENT,
    EmployeeId BIGINT NOT NULL,
    EffectiveFrom DATE NOT NULL,
    EffectiveTo DATE NULL,
    TotalCTC DECIMAL(14,2) NOT NULL,
    Components JSON NULL,
    ApprovedBy BIGINT NULL,
    
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    DeletedAt DATETIME NULL,
    CreatedBy BIGINT NULL,
    UpdatedBy BIGINT NULL,
    
    FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
    FOREIGN KEY (ApprovedBy) REFERENCES AuthUsers(UserId),
    
    INDEX idx_employee (EmployeeId),
    INDEX idx_effective_from (EffectiveFrom),
    INDEX idx_deleted_at (DeletedAt)
);

CREATE TABLE Payruns (
    PayrunId BIGINT AUTO_INCREMENT PRIMARY KEY,
    PayrunName VARCHAR(100),
    PeriodStart DATE NOT NULL,
    PeriodEnd DATE NOT NULL,
    Status ENUM('Draft','Posted','Reversed') DEFAULT 'Draft',
    TotalAmount DECIMAL(14,2) DEFAULT 0,
    
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedBy BIGINT NULL
);

CREATE TABLE PayrunItems (
    PayrunItemId BIGINT AUTO_INCREMENT PRIMARY KEY,
    PayrunId BIGINT NOT NULL,
    EmployeeId BIGINT NOT NULL,
    GrossAmount DECIMAL(14,2) NOT NULL,
    NetAmount DECIMAL(14,2) NOT NULL,
    Components JSON NULL,
    
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedBy BIGINT NULL,
    
    FOREIGN KEY (PayrunId) REFERENCES Payruns(PayrunId),
    FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
    INDEX idx_payrun_emp (PayrunId, EmployeeId)
);

CREATE TABLE EmployeePerformance (
    PerformanceId BIGINT PRIMARY KEY AUTO_INCREMENT,
    EmployeeId BIGINT NOT NULL,
    ReviewDate DATE NOT NULL,
    Rating DECIMAL(3,2) NULL,
    Goals TEXT NULL,
    Achievements TEXT NULL,
    Comments TEXT NULL,
    ReviewedBy BIGINT NULL,
    
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    DeletedAt DATETIME NULL,
    CreatedBy BIGINT NULL,
    UpdatedBy BIGINT NULL,
    
    FOREIGN KEY (EmployeeId) REFERENCES Employees(EmployeeId),
    FOREIGN KEY (ReviewedBy) REFERENCES AuthUsers(UserId),
    
    INDEX idx_employee (EmployeeId),
    INDEX idx_review_date (ReviewDate),
    INDEX idx_deleted_at (DeletedAt)
);
