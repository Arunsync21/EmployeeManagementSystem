using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementBackend.Models
{
    public class AuthUser : AuditableEntity
    {
        [Key]
        public long UserId { get; set; }

        [Required, MaxLength(100)] public string Username { get; set; } = null!;
        [Required, MaxLength(255), EmailAddress] public string Email { get; set; } = null!;
        [Required] public string PasswordHash { get; set; } = null!;
        public UserRole Role { get; set; } = UserRole.Employee;

        public long? EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public DateTime? LastLoginAt { get; set; }

        // Navigation
        public ICollection<EmployeeSalary> ApprovedSalaries { get; set; } = new List<EmployeeSalary>();
        public ICollection<EmployeePerformance> ReviewsGiven { get; set; } = new List<EmployeePerformance>();
    }
}
