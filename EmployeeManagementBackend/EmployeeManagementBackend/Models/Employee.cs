using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeManagementBackend.Models
{
    public class Employee : AuditableEntity
    {
        [Key]
        public long EmployeeId { get; set; }

        [Required, MaxLength(50)]
        public string EmployeeCode { get; set; } = null!;

        // Personal
        [Required, MaxLength(100)]
        public string FirstName { get; set; } = null!;
        [Required, MaxLength(100)]
        public string LastName { get; set; } = null!;
        [Required, MaxLength(100), EmailAddress]
        public string Email { get; set; } = null!;
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public Gender? Gender { get; set; }

        // Address
        public string? Address { get; set; }
        [MaxLength(100)] public string? City { get; set; }
        [MaxLength(100)] public string? State { get; set; }
        [MaxLength(100)] public string? Country { get; set; }

        // Employment
        public long DepartmentId { get; set; }
        public Department Department { get; set; } = null!;
        [MaxLength(255)] public string Position { get; set; } = null!;

        public long? ManagerId { get; set; }
        public Employee? Manager { get; set; }
        public ICollection<Employee> Subordinates { get; set; } = new List<Employee>();

        public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;
        public EmploymentStatus EmploymentStatus { get; set; } = EmploymentStatus.Active;
        public DateTime HireDate { get; set; }
        public DateTime? TerminationDate { get; set; }

        [Column(TypeName = "decimal(12,2)")] public decimal? CurrentSalary { get; set; }
        [MaxLength(3)] public string Currency { get; set; } = "INR";

        // Emergency Contact
        [MaxLength(200)] public string? EmergencyContactName { get; set; }
        [MaxLength(20)] public string? EmergencyContactPhone { get; set; }

        // Navigation
        public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
        public ICollection<EmployeeSalary> Salaries { get; set; } = new List<EmployeeSalary>();
        public ICollection<PayrunItem> PayrunItems { get; set; } = new List<PayrunItem>();
        public ICollection<EmployeePerformance> PerformanceReviews { get; set; } = new List<EmployeePerformance>();
        public AuthUser? AuthUser { get; set; }
    }
}
