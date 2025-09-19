using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeManagementBackend.Models
{
    public class Attendance : AuditableEntity
    {
        [Key]
        public long AttendanceId { get; set; }

        public long EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;

        public DateTime AttendanceDate { get; set; }
        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }

        [Column(TypeName = "decimal(4,2)")] public decimal? TotalHours { get; set; }

        public AttendanceStatus Status { get; set; }
    }
}
