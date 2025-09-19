using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementBackend.Models
{
    public class Department : AuditableEntity
    {
        [Key]
        public long DepartmentId { get; set; }

        [Required, MaxLength(255)]
        public string Name { get; set; } = null!;

        [Required, MaxLength(50)]
        public string Code { get; set; } = null!;

        public long? ManagerId { get; set; }
        public Employee? Manager { get; set; }

        // Navigation
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}
