using EmployeeManagementBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagementBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly EmployeeManagementContext _context;

        public AttendanceController(EmployeeManagementContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Attendance>>> GetAttendanceRecords([FromQuery] DateTime? date)
        {
            IQueryable<Attendance> query = _context.Attendances
                .Include(a => a.Employee)
                .Where(a => a.IsActive && a.DeletedAt == null);

            if (date.HasValue)
            {
                query = query.Where(a => a.AttendanceDate == date.Value.Date);
            }

            var records = await query.ToListAsync();
            return Ok(records);
        }

        [HttpPost("checkin/{employeeId}")]
        public async Task<IActionResult> CheckIn(long employeeId)
        {
            var today = DateTime.UtcNow.Date;

            var existing = await _context.Attendances
                .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.AttendanceDate == today);

            if (existing != null)
            {
                return BadRequest("Already checked in or record exists for today.");
            }

            var now = DateTime.UtcNow;
            var status = now.TimeOfDay > new TimeSpan(9, 30, 0) ? AttendanceStatus.Late : AttendanceStatus.Present;

            var attendance = new Attendance
            {
                EmployeeId = employeeId,
                AttendanceDate = today,
                CheckInTime = now,
                Status = status,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = employeeId
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();

            return Ok(attendance);
        }

        [HttpPost("checkout/{employeeId}")]
        public async Task<IActionResult> CheckOut(long employeeId)
        {
            var today = DateTime.UtcNow.Date;

            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.AttendanceDate == today);

            if (attendance == null) return NotFound("No check-in found for today.");
            if (attendance.CheckOutTime != null) return BadRequest("Already checked out.");

            var now = DateTime.UtcNow;
            var totalHours = (now - attendance.CheckInTime!.Value).TotalHours;

            var status = attendance.Status; // keep "Late" if already late
            if (status == AttendanceStatus.Present || status == AttendanceStatus.Late)
            {
                if (totalHours < 4) status = AttendanceStatus.HalfDay;
                else if (totalHours < 8) status = AttendanceStatus.HalfDay; // or keep "Present" depending policy
                else status = AttendanceStatus.Present;
            }

            attendance.CheckOutTime = now;
            attendance.TotalHours = (decimal)Math.Round(totalHours, 2);
            attendance.Status = status;
            attendance.UpdatedAt = DateTime.UtcNow;
            attendance.UpdatedBy = 1; // TODO: replace with logged-in userId

            await _context.SaveChangesAsync();

            return Ok(attendance);
        }

        [HttpPost("leave/{employeeId}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> MarkLeave(long employeeId, [FromQuery] DateTime date)
        {
            var existing = await _context.Attendances
                .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.AttendanceDate == date.Date);

            if (existing == null)
            {
                _context.Attendances.Add(new Attendance
                {
                    EmployeeId = employeeId,
                    AttendanceDate = date.Date,
                    Status = AttendanceStatus.Leave,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = 1
                });
            }
            else
            {
                existing.Status = AttendanceStatus.Leave;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedBy = 1;
            }

            await _context.SaveChangesAsync();
            return Ok("Leave marked successfully.");
        }

        [HttpPost("holiday/{employeeId}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> MarkHoliday(long employeeId, [FromQuery] DateTime date)
        {
            var existing = await _context.Attendances
                .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.AttendanceDate == date.Date);

            if (existing == null)
            {
                _context.Attendances.Add(new Attendance
                {
                    EmployeeId = employeeId,
                    AttendanceDate = date.Date,
                    Status = AttendanceStatus.Holiday,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = 1
                });
            }
            else
            {
                existing.Status = AttendanceStatus.Holiday;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedBy = 1;
            }

            await _context.SaveChangesAsync();
            return Ok("Holiday marked successfully.");
        }
    }
}
