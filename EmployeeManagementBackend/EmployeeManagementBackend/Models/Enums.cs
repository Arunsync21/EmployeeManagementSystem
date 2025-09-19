namespace EmployeeManagementBackend.Models
{
    public enum Gender { Male, Female, Other }
    public enum EmploymentType { FullTime, PartTime, Contract, Intern }
    public enum EmploymentStatus { Active, Inactive, Terminated, OnLeave }
    public enum AttendanceStatus { Present, Absent, Late, HalfDay, Holiday, Leave }
    public enum UserRole { Admin, HR, Manager, Employee }
    public enum PayrunStatus { Draft, Posted, Reversed }
}
