using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeManagementBackend.Models
{
    public class EmployeeDto
    {
        [Key]
        public long EmployeeId { get; set; }

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
        [MaxLength(255)] public string Position { get; set; } = null!;

        public UserRole Role { get; set; } = UserRole.Employee;
        public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;
        public EmploymentStatus EmploymentStatus { get; set; } = EmploymentStatus.Active;
        public DateTime HireDate { get; set; }
        public DateTime? TerminationDate { get; set; }

        [Column(TypeName = "decimal(12,2)")] public decimal? CurrentSalary { get; set; }
        [MaxLength(3)] public string Currency { get; set; } = "INR";

        // Emergency Contact
        [MaxLength(200)] public string? EmergencyContactName { get; set; }
        [MaxLength(20)] public string? EmergencyContactPhone { get; set; }

        public long? CreatedBy { get; set; }
    }
}
