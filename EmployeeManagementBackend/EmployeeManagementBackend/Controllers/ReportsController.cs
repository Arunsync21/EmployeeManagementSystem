using EmployeeManagementBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagementBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IExcelReportService _excelReportService;

        public ReportsController(IExcelReportService excelReportService)
        {
            _excelReportService = excelReportService;
        }

        [HttpGet("employee-directory")]
        public async Task<IActionResult> GetEmployeeDirectoryReport()
        {
            try
            {
                var excelData = await _excelReportService.GenerateEmployeeDirectoryReportAsync();
                var fileName = $"Employee_Directory_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                
                return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating employee directory report", error = ex.Message });
            }
        }

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartmentReport()
        {
            try
            {
                var excelData = await _excelReportService.GenerateDepartmentReportAsync();
                var fileName = $"Department_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                
                return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating department report", error = ex.Message });
            }
        }

        [HttpGet("attendance")]
        public async Task<IActionResult> GetAttendanceReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] long? employeeId = null)
        {
            try
            {
                var excelData = await _excelReportService.GenerateAttendanceReportAsync(startDate, endDate, employeeId);
                var fileName = $"Attendance_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                
                return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating attendance report", error = ex.Message });
            }
        }

        [HttpGet("salary")]
        public async Task<IActionResult> GetSalaryReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] long? departmentId = null)
        {
            try
            {
                var excelData = await _excelReportService.GenerateSalaryReportAsync(startDate, endDate, departmentId);
                var fileName = $"Salary_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                
                return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating salary report", error = ex.Message });
            }
        }

        [HttpGet("department-managers")]
        public async Task<IActionResult> GetDepartmentManagerReport()
        {
            try
            {
                var excelData = await _excelReportService.GenerateDepartmentManagerReportAsync();
                var fileName = $"Department_Managers_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                
                return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating department manager report", error = ex.Message });
            }
        }

        [HttpGet("comprehensive")]
        public async Task<IActionResult> GetComprehensiveReport()
        {
            try
            {
                var excelData = await _excelReportService.GenerateComprehensiveReportAsync();
                var fileName = $"Comprehensive_Report_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                
                return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating comprehensive report", error = ex.Message });
            }
        }

        [HttpGet("attendance/summary")]
        public async Task<IActionResult> GetAttendanceSummary(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                // This could be expanded to return JSON summary data for dashboards
                var excelData = await _excelReportService.GenerateAttendanceReportAsync(startDate, endDate);
                var fileName = $"Attendance_Summary_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                
                return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating attendance summary", error = ex.Message });
            }
        }
    }
}