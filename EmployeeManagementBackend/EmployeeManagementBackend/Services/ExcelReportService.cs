using EmployeeManagementBackend.Models;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;

namespace EmployeeManagementBackend.Services
{
    public interface IExcelReportService
    {
        Task<byte[]> GenerateEmployeeDirectoryReportAsync();
        Task<byte[]> GenerateDepartmentReportAsync();
        Task<byte[]> GenerateAttendanceReportAsync(DateTime? startDate = null, DateTime? endDate = null, long? employeeId = null);
        Task<byte[]> GenerateSalaryReportAsync(DateTime? startDate = null, DateTime? endDate = null, long? departmentId = null);
        Task<byte[]> GenerateDepartmentManagerReportAsync();
        Task<byte[]> GenerateComprehensiveReportAsync();
    }

    public class ExcelReportService : IExcelReportService
    {
        private readonly EmployeeManagementContext _context;

        public ExcelReportService(EmployeeManagementContext context)
        {
            _context = context;
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        private string FormatCurrency(decimal? amount, string currency)
        {
            if (!amount.HasValue) return "";

            var cultureInfo = currency switch
            {
                "USD" => new System.Globalization.CultureInfo("en-US"),
                "EUR" => new System.Globalization.CultureInfo("de-DE"),
                "INR" => new System.Globalization.CultureInfo("en-IN"),
                _ => new System.Globalization.CultureInfo("en-US")
            };

            var symbol = currency switch
            {
                "USD" => "$",
                "EUR" => "€",
                "INR" => "₹",
                _ => currency
            };

            return $"{symbol}{amount.Value:N2}";
        }

        public async Task<byte[]> GenerateEmployeeDirectoryReportAsync()
        {
            try
            {
                var employees = await _context.Employees
                    .Include(e => e.Department)
                    .Include(e => e.Manager)
                    .Where(e => e.EmploymentStatus == EmploymentStatus.Active)
                    .OrderBy(e => e.Department.Name)
                    .ThenBy(e => e.LastName)
                    .ToListAsync();

                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Employee Directory");

                // Headers
                var headers = new[]
                {
                "Employee Code", "Full Name", "Email", "Phone", "Department",
                "Position", "Manager", "Employment Type", "Hire Date", "Current Salary (in INR)",
                "Emergency Contact Name", "Emergency Contact Number"
            };

                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                }

                // Style headers
                using (var range = worksheet.Cells[1, 1, 1, headers.Length])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
                    range.Style.Border.BorderAround(ExcelBorderStyle.Thin);
                }

                // Data
                for (int i = 0; i < employees.Count; i++)
                {
                    var emp = employees[i];
                    var row = i + 2;

                    worksheet.Cells[row, 1].Value = emp.EmployeeCode;
                    worksheet.Cells[row, 2].Value = $"{emp.FirstName} {emp.LastName}";
                    worksheet.Cells[row, 3].Value = emp.Email;
                    worksheet.Cells[row, 4].Value = emp.PhoneNumber;
                    worksheet.Cells[row, 5].Value = emp.Department.Name;
                    worksheet.Cells[row, 6].Value = emp.Position;
                    worksheet.Cells[row, 7].Value = emp.Manager != null ? $"{emp.Manager.FirstName} {emp.Manager.LastName}" : "";
                    worksheet.Cells[row, 8].Value = emp.EmploymentType.ToString();
                    worksheet.Cells[row, 9].Value = emp.HireDate.ToString("yyyy-MM-dd");
                    worksheet.Cells[row, 10].Value = emp.CurrentSalary;
                    worksheet.Cells[row, 11].Value = emp.EmergencyContactName ?? "";
                    worksheet.Cells[row, 12].Value = emp.EmergencyContactPhone ?? "";
                }

                worksheet.Cells.AutoFitColumns();
                return package.GetAsByteArray();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error generating employee directory report: {ex.Message}", ex);
            }
        }

        public async Task<byte[]> GenerateDepartmentReportAsync()
        {
            try
            {
                var departments = await _context.Departments
                    .Include(d => d.Manager)
                    .Include(d => d.Employees.Where(e => e.EmploymentStatus == EmploymentStatus.Active))
                    .OrderBy(d => d.Name)
                    .ToListAsync();

                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Department Report");

                // Headers
                var headers = new[]
                {
                "Department Code", "Department Name", "Department Manager", "Total Employees",
                "Active Employees", "Average Salary (in INR)", "Total Salary Cost (in INR)"
            };

                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                }

                // Style headers
                using (var range = worksheet.Cells[1, 1, 1, headers.Length])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGreen);
                    range.Style.Border.BorderAround(ExcelBorderStyle.Thin);
                }

                // Data
                for (int i = 0; i < departments.Count; i++)
                {
                    var dept = departments[i];
                    var row = i + 2;
                    var activeEmployees = dept.Employees.Where(e => e.EmploymentStatus == EmploymentStatus.Active).ToList();
                    var employeesWithSalary = activeEmployees.Where(e => e.CurrentSalary.HasValue).ToList();

                    worksheet.Cells[row, 1].Value = dept.Code;
                    worksheet.Cells[row, 2].Value = dept.Name;
                    worksheet.Cells[row, 3].Value = dept.Manager != null ? $"{dept.Manager.FirstName} {dept.Manager.LastName}" : "";
                    worksheet.Cells[row, 4].Value = dept.Employees.Count;
                    worksheet.Cells[row, 5].Value = activeEmployees.Count;

                    // Handle mixed currencies for average and total
                    if (employeesWithSalary.Any())
                    {
                        var currencyGroups = employeesWithSalary.GroupBy(e => e.Currency).ToList();
                        if (currencyGroups.Count == 1)
                        {
                            // Single currency department
                            var currency = currencyGroups.First().Key;
                            var salaries = currencyGroups.First().Select(e => e.CurrentSalary!.Value);
                            worksheet.Cells[row, 6].Value = FormatCurrency(salaries.Average(), currency);
                            worksheet.Cells[row, 7].Value = FormatCurrency(salaries.Sum(), currency);
                        }
                        else
                        {
                            // Mixed currencies - show breakdown
                            var avgBreakdown = string.Join(", ", currencyGroups.Select(g =>
                                $"{FormatCurrency(g.Select(e => e.CurrentSalary!.Value).Average(), g.Key)} ({g.Count()})"));
                            var totalBreakdown = string.Join(", ", currencyGroups.Select(g =>
                                FormatCurrency(g.Select(e => e.CurrentSalary!.Value).Sum(), g.Key)));

                            worksheet.Cells[row, 6].Value = avgBreakdown;
                            worksheet.Cells[row, 7].Value = totalBreakdown;
                        }
                    }
                    else
                    {
                        worksheet.Cells[row, 6].Value = "";
                        worksheet.Cells[row, 7].Value = "";
                    }
                }

                worksheet.Cells.AutoFitColumns();
                return package.GetAsByteArray();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error generating department report: {ex.Message}", ex);
            }
        }

        public async Task<byte[]> GenerateAttendanceReportAsync(DateTime? startDate = null, DateTime? endDate = null, long? employeeId = null)
        {
            try
            {
                startDate ??= DateTime.Now.AddDays(-30);
                endDate ??= DateTime.Now;

                var query = _context.Attendances
                    .Include(a => a.Employee)
                    .ThenInclude(e => e.Department)
                    .Where(a => a.AttendanceDate >= startDate && a.AttendanceDate <= endDate);

                if (employeeId.HasValue)
                    query = query.Where(a => a.EmployeeId == employeeId.Value);

                var attendances = await query
                    .OrderBy(a => a.Employee.FirstName)
                    .ThenBy(a => a.AttendanceDate)
                    .ToListAsync();

                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Attendance Report");

                // Headers
                var headers = new[]
                {
                "Employee Code", "Employee Name", "Department", "Date",
                "Check In", "Check Out", "Total Hours", "Status"
            };

                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                }

                // Style headers
                using (var range = worksheet.Cells[1, 1, 1, headers.Length])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightYellow);
                    range.Style.Border.BorderAround(ExcelBorderStyle.Thin);
                }

                // Data
                for (int i = 0; i < attendances.Count; i++)
                {
                    var att = attendances[i];
                    var row = i + 2;

                    worksheet.Cells[row, 1].Value = att.Employee.EmployeeCode;
                    worksheet.Cells[row, 2].Value = $"{att.Employee.FirstName} {att.Employee.LastName}";
                    worksheet.Cells[row, 3].Value = att.Employee.Department.Name;
                    worksheet.Cells[row, 4].Value = att.AttendanceDate.ToString("yyyy-MM-dd");
                    worksheet.Cells[row, 5].Value = att.CheckInTime?.ToString("HH:mm") ?? "";
                    worksheet.Cells[row, 6].Value = att.CheckOutTime?.ToString("HH:mm") ?? "";
                    worksheet.Cells[row, 7].Value = att.TotalHours?.ToString("F2") ?? "";
                    worksheet.Cells[row, 8].Value = att.Status.ToString();

                    // Color code based on status
                    var statusColor = att.Status switch
                    {
                        AttendanceStatus.Present => Color.LightGreen,
                        AttendanceStatus.Absent => Color.LightCoral,
                        AttendanceStatus.Late => Color.Orange,
                        AttendanceStatus.HalfDay => Color.LightBlue,
                        AttendanceStatus.Holiday => Color.LightGray,
                        AttendanceStatus.Leave => Color.LightPink,
                        _ => Color.White
                    };

                    worksheet.Cells[row, 8].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    worksheet.Cells[row, 8].Style.Fill.BackgroundColor.SetColor(statusColor);
                }

                worksheet.Cells.AutoFitColumns();
                return package.GetAsByteArray();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error generating attendance report: {ex.Message}", ex);
            }
        }

        public async Task<byte[]> GenerateSalaryReportAsync(DateTime? startDate = null, DateTime? endDate = null, long? departmentId = null)
        {
            startDate ??= DateTime.Now.AddMonths(-12);
            endDate ??= DateTime.Now;

            try
            {
                var query = _context.EmployeeSalaries.AsQueryable();

                // Apply date filter
                query = query.Where(s => s.EffectiveFrom >= startDate && s.EffectiveFrom <= endDate);

                // Apply department filter if specified
                if (departmentId.HasValue)
                    query = query.Where(s => s.Employee.DepartmentId == departmentId.Value);

                // Get the salary records with employee info
                var salaryRecords = await query
                    .Include(s => s.Employee)
                    .Where(s => s.IsActive) // Only get active salary records
                    .Select(s => new
                    {
                        s.EmployeeSalaryId,
                        s.EffectiveFrom,
                        s.EffectiveTo,
                        s.TotalCTC,
                        s.ComponentsJson,
                        Employee = new
                        {
                            s.Employee.EmployeeId,
                            s.Employee.EmployeeCode,
                            s.Employee.FirstName,
                            s.Employee.LastName,
                            s.Employee.Position,
                            s.Employee.Currency,
                            s.Employee.DepartmentId
                        }
                    })
                    .ToListAsync();

                // Get department information
                var departmentIds = salaryRecords.Select(s => s.Employee.DepartmentId).Distinct().ToList();
                var departments = await _context.Departments
                    .Where(d => departmentIds.Contains(d.DepartmentId))
                    .ToDictionaryAsync(d => d.DepartmentId, d => d.Name);

                // Sort the records
                var salaries = salaryRecords
                    .OrderBy(s => departments.GetValueOrDefault(s.Employee.DepartmentId, "Unknown"))
                    .ThenBy(s => s.Employee.LastName)
                    .ThenByDescending(s => s.EffectiveFrom)
                    .ToList();

                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Salary Report");

                // Headers
                var headers = new[]
                {
                    "Employee Code", "Employee Name", "Department", "Position",
                    "Effective From", "Effective To", "Total CTC (in INR)", "Components"
                };

                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                }

                // Style headers
                using (var range = worksheet.Cells[1, 1, 1, headers.Length])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightCyan);
                    range.Style.Border.BorderAround(ExcelBorderStyle.Thin);
                }

                // Data
                for (int i = 0; i < salaries.Count; i++)
                {
                    var sal = salaries[i];
                    var row = i + 2;

                    worksheet.Cells[row, 1].Value = sal.Employee.EmployeeCode;
                    worksheet.Cells[row, 2].Value = $"{sal.Employee.FirstName} {sal.Employee.LastName}";
                    worksheet.Cells[row, 3].Value = departments.GetValueOrDefault(sal.Employee.DepartmentId, "Unknown");
                    worksheet.Cells[row, 4].Value = sal.Employee.Position;
                    worksheet.Cells[row, 5].Value = sal.EffectiveFrom.ToString("yyyy-MM-dd");
                    worksheet.Cells[row, 6].Value = sal.EffectiveTo?.ToString("yyyy-MM-dd") ?? "Current";
                    worksheet.Cells[row, 7].Value = sal.TotalCTC;
                    worksheet.Cells[row, 8].Value = sal.ComponentsJson ?? "";
                }

                worksheet.Cells.AutoFitColumns();
                return package.GetAsByteArray();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error generating salary report: {ex.Message}.", ex);
            }
        }

        public async Task<byte[]> GenerateDepartmentManagerReportAsync()
        {
            try
            {
                var departments = await _context.Departments
                    .Include(d => d.Manager)
                    .Include(d => d.Employees.Where(e => e.EmploymentStatus == EmploymentStatus.Active))
                    .ThenInclude(e => e.Subordinates.Where(s => s.EmploymentStatus == EmploymentStatus.Active))
                    .OrderBy(d => d.Name)
                    .ToListAsync();

                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add("Department Managers");

                // Headers
                var headers = new[]
                {
                "Department", "Department Manager", "Manager Email", "Manager Phone",
                "Total Team Size", "Direct Reports", "Department Employees", "Manager Since"
            };

                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                }

                // Style headers
                using (var range = worksheet.Cells[1, 1, 1, headers.Length])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightSalmon);
                    range.Style.Border.BorderAround(ExcelBorderStyle.Thin);
                }

                // Data
                for (int i = 0; i < departments.Count; i++)
                {
                    var dept = departments[i];
                    var row = i + 2;
                    var deptEmployees = dept.Employees.Where(e => e.EmploymentStatus == EmploymentStatus.Active).ToList();

                    worksheet.Cells[row, 1].Value = dept.Name;

                    if (dept.Manager != null)
                    {
                        worksheet.Cells[row, 2].Value = $"{dept.Manager.FirstName} {dept.Manager.LastName}";
                        worksheet.Cells[row, 3].Value = dept.Manager.Email;
                        worksheet.Cells[row, 4].Value = dept.Manager.PhoneNumber ?? "";

                        // Calculate team size (direct reports + department employees)
                        var directReports = dept.Manager.Subordinates.Where(s => s.EmploymentStatus == EmploymentStatus.Active).Count();
                        worksheet.Cells[row, 5].Value = directReports + deptEmployees.Count;
                        worksheet.Cells[row, 6].Value = directReports;
                        worksheet.Cells[row, 7].Value = deptEmployees.Count;
                        worksheet.Cells[row, 8].Value = dept.Manager.HireDate.ToString("yyyy-MM-dd");
                    }
                    else
                    {
                        worksheet.Cells[row, 2].Value = "No Manager Assigned";
                        worksheet.Cells[row, 3].Value = "";
                        worksheet.Cells[row, 4].Value = "";
                        worksheet.Cells[row, 5].Value = deptEmployees.Count;
                        worksheet.Cells[row, 6].Value = 0;
                        worksheet.Cells[row, 7].Value = deptEmployees.Count;
                        worksheet.Cells[row, 8].Value = "";
                    }
                }

                worksheet.Cells.AutoFitColumns();
                return package.GetAsByteArray();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error generating department manager report: {ex.Message}", ex);
            }
        }

        public async Task<byte[]> GenerateComprehensiveReportAsync()
        {
            try
            {
                using var package = new ExcelPackage();

                // Employee Summary
                await CreateEmployeeSummarySheet(package);

                // Department Summary
                await CreateDepartmentSummarySheet(package);

                // Recent Attendance Summary
                await CreateAttendanceSummarySheet(package);

                // Salary Summary
                await CreateSalarySummarySheet(package);

                return package.GetAsByteArray();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error generating comprehensive report: {ex.Message}", ex);
            }
        }

        private async Task CreateEmployeeSummarySheet(ExcelPackage package)
        {
            try
            {
                var worksheet = package.Workbook.Worksheets.Add("Employee Summary");

                var employees = await _context.Employees
                    .Include(e => e.Department)
                    .Where(e => e.EmploymentStatus == EmploymentStatus.Active)
                    .ToListAsync();

                var headers = new[] { "Total Employees", "By Employment Type", "By Department" };

                worksheet.Cells[1, 1].Value = "Employee Statistics";
                worksheet.Cells[1, 1].Style.Font.Bold = true;
                worksheet.Cells[1, 1].Style.Font.Size = 16;

                worksheet.Cells[3, 1].Value = "Total Active Employees";
                worksheet.Cells[3, 2].Value = employees.Count;

                // Employment Type breakdown
                var empTypeGroups = employees.GroupBy(e => e.EmploymentType).ToList();
                int row = 5;
                worksheet.Cells[row, 1].Value = "Employment Type Breakdown";
                worksheet.Cells[row, 1].Style.Font.Bold = true;
                row++;

                foreach (var group in empTypeGroups)
                {
                    worksheet.Cells[row, 1].Value = group.Key.ToString();
                    worksheet.Cells[row, 2].Value = group.Count();
                    row++;
                }

                // Department breakdown
                row += 2;
                worksheet.Cells[row, 1].Value = "Department Breakdown";
                worksheet.Cells[row, 1].Style.Font.Bold = true;
                row++;

                var deptGroups = employees.GroupBy(e => e.Department.Name).ToList();
                foreach (var group in deptGroups)
                {
                    worksheet.Cells[row, 1].Value = group.Key;
                    worksheet.Cells[row, 2].Value = group.Count();
                    row++;
                }

                worksheet.Cells.AutoFitColumns();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error creating employee summary sheet: {ex.Message}", ex);
            }
        }

        private async Task CreateDepartmentSummarySheet(ExcelPackage package)
        {
            try
            {
                var worksheet = package.Workbook.Worksheets.Add("Department Summary");

                var departments = await _context.Departments
                    .Include(d => d.Manager)
                    .Include(d => d.Employees.Where(e => e.EmploymentStatus == EmploymentStatus.Active))
                    .ToListAsync();

                worksheet.Cells[1, 1].Value = "Department Overview";
                worksheet.Cells[1, 1].Style.Font.Bold = true;
                worksheet.Cells[1, 1].Style.Font.Size = 16;

                var headers = new[] { "Department", "Manager", "Employee Count", "Avg Salary", "Total Cost" };
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[3, i + 1].Value = headers[i];
                    worksheet.Cells[3, i + 1].Style.Font.Bold = true;
                }

                for (int i = 0; i < departments.Count; i++)
                {
                    var dept = departments[i];
                    var row = i + 4;
                    var activeEmps = dept.Employees.Where(e => e.EmploymentStatus == EmploymentStatus.Active).ToList();
                    var employeesWithSalary = activeEmps.Where(e => e.CurrentSalary.HasValue).ToList();

                    worksheet.Cells[row, 1].Value = dept.Name;
                    worksheet.Cells[row, 2].Value = dept.Manager != null ? $"{dept.Manager.FirstName} {dept.Manager.LastName}" : "";
                    worksheet.Cells[row, 3].Value = activeEmps.Count;

                    if (employeesWithSalary.Any())
                    {
                        var currencyGroups = employeesWithSalary.GroupBy(e => e.Currency).ToList();
                        if (currencyGroups.Count == 1)
                        {
                            // Single currency
                            var currency = currencyGroups.First().Key;
                            var salaries = currencyGroups.First().Select(e => e.CurrentSalary!.Value);
                            worksheet.Cells[row, 4].Value = FormatCurrency(salaries.Average(), currency);
                            worksheet.Cells[row, 5].Value = FormatCurrency(salaries.Sum(), currency);
                        }
                        else
                        {
                            // Mixed currencies
                            var avgBreakdown = string.Join(", ", currencyGroups.Select(g =>
                                FormatCurrency(g.Select(e => e.CurrentSalary!.Value).Average(), g.Key)));
                            var totalBreakdown = string.Join(", ", currencyGroups.Select(g =>
                                FormatCurrency(g.Select(e => e.CurrentSalary!.Value).Sum(), g.Key)));

                            worksheet.Cells[row, 4].Value = avgBreakdown;
                            worksheet.Cells[row, 5].Value = totalBreakdown;
                        }
                    }
                    else
                    {
                        worksheet.Cells[row, 4].Value = "N/A";
                        worksheet.Cells[row, 5].Value = "N/A";
                    }
                }

                worksheet.Cells.AutoFitColumns();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error creating department summary sheet: {ex.Message}", ex);
            }
        }

        private async Task CreateAttendanceSummarySheet(ExcelPackage package)
        {
            try
            {
                var worksheet = package.Workbook.Worksheets.Add("Attendance Summary");

                var startDate = DateTime.Now.AddDays(-30);
                var attendances = await _context.Attendances
                    .Include(a => a.Employee)
                    .Where(a => a.AttendanceDate >= startDate)
                    .ToListAsync();

                worksheet.Cells[1, 1].Value = "Attendance Summary (Last 30 Days)";
                worksheet.Cells[1, 1].Style.Font.Bold = true;
                worksheet.Cells[1, 1].Style.Font.Size = 16;

                var statusGroups = attendances.GroupBy(a => a.Status).ToList();

                worksheet.Cells[3, 1].Value = "Attendance Status Breakdown";
                worksheet.Cells[3, 1].Style.Font.Bold = true;

                int row = 4;
                foreach (var group in statusGroups)
                {
                    worksheet.Cells[row, 1].Value = group.Key.ToString();
                    worksheet.Cells[row, 2].Value = group.Count();
                    row++;
                }

                worksheet.Cells.AutoFitColumns();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error creating attendance summary sheet: {ex.Message}", ex);
            }
        }

        private async Task CreateSalarySummarySheet(ExcelPackage package)
        {
            try
            {
                var worksheet = package.Workbook.Worksheets.Add("Salary Summary");

                var employees = await _context.Employees
                    .Include(e => e.Department)
                    .Where(e => e.EmploymentStatus == EmploymentStatus.Active && e.CurrentSalary.HasValue)
                    .ToListAsync();

                worksheet.Cells[1, 1].Value = "Salary Overview";
                worksheet.Cells[1, 1].Style.Font.Bold = true;
                worksheet.Cells[1, 1].Style.Font.Size = 16;

                worksheet.Cells[3, 1].Value = "Total Employees with Salary Data";
                worksheet.Cells[3, 2].Value = employees.Count;

                // Group by currency for proper statistics
                var currencyGroups = employees.GroupBy(e => e.Currency).ToList();

                int row = 5;
                worksheet.Cells[row, 1].Value = "Salary Statistics by Currency";
                worksheet.Cells[row, 1].Style.Font.Bold = true;
                row++;

                foreach (var currencyGroup in currencyGroups)
                {
                    var currency = currencyGroup.Key;
                    var salaries = currencyGroup.Select(e => e.CurrentSalary!.Value).ToList();

                    worksheet.Cells[row, 1].Value = $"{currency} Statistics:";
                    worksheet.Cells[row, 1].Style.Font.Bold = true;
                    row++;

                    worksheet.Cells[row, 1].Value = "  Employee Count";
                    worksheet.Cells[row, 2].Value = salaries.Count;
                    row++;

                    worksheet.Cells[row, 1].Value = "  Average Salary";
                    worksheet.Cells[row, 2].Value = FormatCurrency(salaries.Average(), currency);
                    row++;

                    worksheet.Cells[row, 1].Value = "  Minimum Salary";
                    worksheet.Cells[row, 2].Value = FormatCurrency(salaries.Min(), currency);
                    row++;

                    worksheet.Cells[row, 1].Value = "  Maximum Salary";
                    worksheet.Cells[row, 2].Value = FormatCurrency(salaries.Max(), currency);
                    row++;

                    worksheet.Cells[row, 1].Value = "  Total Cost";
                    worksheet.Cells[row, 2].Value = FormatCurrency(salaries.Sum(), currency);
                    row += 2; // Add space between currencies
                }

                worksheet.Cells.AutoFitColumns();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error creating salary summary sheet: {ex.Message}", ex);
            }
        }
    }
}