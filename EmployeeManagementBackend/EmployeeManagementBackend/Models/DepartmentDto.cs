namespace EmployeeManagementBackend.Models
{
    public class DepartmentDto
    {
        public long DepartmentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        // Computed values
        public int EmployeeCount { get; set; }
        public string? ManagerName { get; set; }
    }
}
