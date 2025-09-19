# Excel Reports Service

This service provides comprehensive Excel report generation for the Employee Management System. It generates professional Excel files with proper formatting, colors, and multiple sheets for different data views.

## Features

### Report Types Available

1. **Employee Directory Report** - Complete employee listing with personal and employment details
2. **Department Report** - Department-wise statistics and salary summaries with manager information
3. **Department Managers Report** - Detailed view of department managers and their teams
4. **Attendance Report** - Detailed attendance records with filtering options
5. **Salary Report** - Salary history and compensation details
6. **Comprehensive Report** - Multi-sheet report with all summaries

## API Endpoints

### Base URL: `/api/reports`

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### 1. Employee Directory Report
```http
GET /api/reports/employee-directory
```
**Response**: Excel file with active employees data including:
- Employee Code, Name, Email, Phone
- Department, Position, Manager
- Employment Type, Hire Date, Current Salary (formatted by currency), Currency
- Emergency Contact Information

### 2. Department Report
```http
GET /api/reports/departments
```
**Response**: Excel file with department statistics:
- Department Code, Name, and Manager
- Employee counts (total and active)
- Average and total salary costs (grouped by currency for mixed-currency departments)

### 3. Department Managers Report
```http
GET /api/reports/department-managers
```
**Response**: Excel file with department management information:
- Department name and assigned manager
- Manager contact details (email, phone)
- Team size metrics (total team, direct reports, department employees)
- Manager tenure (hire date)

### 4. Attendance Report
```http
GET /api/reports/attendance?startDate=2024-01-01&endDate=2024-12-31&employeeId=1
```
**Parameters**:
- `startDate` (optional): Start date for report (default: 30 days ago)
- `endDate` (optional): End date for report (default: today)
- `employeeId` (optional): Filter by specific employee

**Response**: Excel file with attendance records:
- Employee details and department
- Date, check-in/out times, total hours
- Status with color coding (Present=Green, Absent=Red, Late=Orange, etc.)

### 5. Salary Report
```http
GET /api/reports/salary?startDate=2024-01-01&endDate=2024-12-31&departmentId=1
```
**Parameters**:
- `startDate` (optional): Start date for salary records (default: 12 months ago)
- `endDate` (optional): End date for salary records (default: today)
- `departmentId` (optional): Filter by specific department

**Response**: Excel file with salary information:
- Employee details and position
- Effective dates, total CTC (formatted by employee's currency), Currency
- Salary components (JSON format)

### 6. Comprehensive Report
```http
GET /api/reports/comprehensive
```
**Response**: Multi-sheet Excel file containing:
- **Employee Summary**: Statistics and breakdowns
- **Department Summary**: Department overview with managers and costs
- **Attendance Summary**: Recent attendance statistics
- **Salary Summary**: Salary statistics and ranges (grouped by currency)

## Multi-Currency Support

The service supports three currencies: **INR (₹)**, **USD ($)**, and **EUR (€)**. 

### Currency Handling
- **Individual Reports**: Salaries are formatted with the appropriate currency symbol based on each employee's currency setting
- **Department Reports**: When departments have employees with mixed currencies, salary statistics are broken down by currency (e.g., "₹50,000 (5), $2,000 (3)" showing average salary and employee count per currency)
- **Salary Summary**: Statistics are grouped and displayed separately for each currency
- **Currency Column**: Added to relevant reports for clarity

### Currency Formatting Examples
- INR: ₹75,000.00
- USD: $5,000.00  
- EUR: €4,500.00

## Excel File Features

### Formatting
- **Headers**: Bold text with colored backgrounds
- **Auto-fit columns**: Automatically sized for content
- **Color coding**: Status-based cell coloring for attendance
- **Professional styling**: Clean, readable format

### File Naming
All generated files include timestamps:
- `Employee_Directory_20241217_143022.xlsx`
- `Department_Report_20241217_143022.xlsx`
- `Attendance_Report_20241217_143022.xlsx`
- `Salary_Report_20241217_143022.xlsx`
- `Comprehensive_Report_20241217_143022.xlsx`

## Usage Examples

### Using HTTP Client (like Postman or VS Code REST Client)

```http
### Get employee directory
GET https://localhost:7000/api/reports/employee-directory
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Get attendance for December 2024
GET https://localhost:7000/api/reports/attendance?startDate=2024-12-01&endDate=2024-12-31
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Get salary report for HR department
GET https://localhost:7000/api/reports/salary?departmentId=2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Get department managers report
GET https://localhost:7000/api/reports/department-managers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Using JavaScript/Frontend

```javascript
// Function to download Excel report
async function downloadReport(reportType, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/reports/${reportType}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    
    if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'report.xlsx';
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
    }
}

// Examples
downloadReport('employee-directory');
downloadReport('attendance', { startDate: '2024-01-01', endDate: '2024-12-31' });
downloadReport('salary', { departmentId: 1 });
downloadReport('department-managers');
```

## Dependencies

The service uses the following NuGet packages:
- **EPPlus 7.0.0**: Excel file generation and manipulation
- **Entity Framework Core**: Database access
- **Microsoft.AspNetCore.Authorization**: JWT authentication

## Error Handling

All endpoints return appropriate HTTP status codes:
- **200 OK**: Successful report generation
- **401 Unauthorized**: Missing or invalid JWT token
- **500 Internal Server Error**: Report generation failed

Error responses include detailed error messages:
```json
{
    "message": "Error generating employee directory report",
    "error": "Database connection failed"
}
```

## Performance Considerations

- Reports are generated on-demand (not cached)
- Large datasets may take longer to process
- Consider implementing pagination for very large reports
- Memory usage scales with data size

## Security

- All endpoints require JWT authentication
- Users can only access reports based on their role permissions
- No sensitive data is logged in error messages
- Excel files are generated in-memory and not stored on server

## Customization

To add new report types:

1. Add method to `IExcelReportService` interface
2. Implement method in `ExcelReportService` class
3. Add endpoint to `ReportsController`
4. Update documentation

Example:
```csharp
public async Task<byte[]> GenerateCustomReportAsync(CustomParameters params)
{
    // Implementation here
}
```