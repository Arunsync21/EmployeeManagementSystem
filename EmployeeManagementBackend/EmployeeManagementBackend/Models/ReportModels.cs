using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementBackend.Models
{
    public class ReportParametersDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public long? EmployeeId { get; set; }
        public long? DepartmentId { get; set; }
    }

    public class AttendanceReportParametersDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public long? EmployeeId { get; set; }
        public long? DepartmentId { get; set; }
        public AttendanceStatus? Status { get; set; }
    }

    public class SalaryReportParametersDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public long? DepartmentId { get; set; }
        public decimal? MinSalary { get; set; }
        public decimal? MaxSalary { get; set; }
    }

    public class ReportMetadataDto
    {
        public string ReportName { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime GeneratedAt { get; set; }
        public string GeneratedBy { get; set; } = null!;
        public int RecordCount { get; set; }
        public Dictionary<string, object>? Parameters { get; set; }
    }
}