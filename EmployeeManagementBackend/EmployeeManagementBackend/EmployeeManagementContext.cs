using EmployeeManagementBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagementBackend
{
    public class EmployeeManagementContext : DbContext
    {
        public EmployeeManagementContext(DbContextOptions<EmployeeManagementContext> options) : base(options) { }

        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<Employee> Employees { get; set; } = null!;
        public DbSet<Attendance> Attendances { get; set; } = null!;
        public DbSet<AuthUser> AuthUsers { get; set; } = null!;
        public DbSet<EmployeeSalary> EmployeeSalaries { get; set; } = null!;
        public DbSet<Payrun> Payruns { get; set; } = null!;
        public DbSet<PayrunItem> PayrunItems { get; set; } = null!;
        public DbSet<EmployeePerformance> EmployeePerformances { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Enums stored as strings
            modelBuilder.Entity<Employee>().Property(e => e.Gender).HasConversion<string>();
            modelBuilder.Entity<Employee>().Property(e => e.EmploymentType).HasConversion<string>();
            modelBuilder.Entity<Employee>().Property(e => e.EmploymentStatus).HasConversion<string>();
            modelBuilder.Entity<Attendance>().Property(a => a.Status).HasConversion<string>();
            modelBuilder.Entity<AuthUser>().Property(u => u.Role).HasConversion<string>();
            modelBuilder.Entity<Payrun>().Property(p => p.Status).HasConversion<string>();

            // Self reference (manager → employees)
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Manager)
                .WithMany(m => m.Subordinates)
                .HasForeignKey(e => e.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Department manager relationship
            modelBuilder.Entity<Department>()
                .HasOne(d => d.Manager)
                .WithMany()
                .HasForeignKey(d => d.ManagerId)
                .OnDelete(DeleteBehavior.SetNull);

            // EmployeeSalary configuration
            modelBuilder.Entity<EmployeeSalary>()
                .ToTable("EmployeeSalary"); // Ensure correct table name

            // EmployeeSalary configuration
            modelBuilder.Entity<Attendance>()
                .ToTable("Attendance"); // Ensure correct table name

            // Employee → EmployeeSalary relationship
            modelBuilder.Entity<EmployeeSalary>()
                .HasOne(s => s.Employee)
                .WithMany(e => e.Salaries)
                .HasForeignKey(s => s.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            // Employee → AuthUser relationship (one-to-one)
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.AuthUser)
                .WithOne(u => u.Employee)
                .HasForeignKey<AuthUser>(u => u.EmployeeId)
                .OnDelete(DeleteBehavior.SetNull);

            // Salary ApprovedBy → AuthUser
            modelBuilder.Entity<EmployeeSalary>()
                .HasOne(s => s.ApprovedByUser)
                .WithMany(u => u.ApprovedSalaries)
                .HasForeignKey(s => s.ApprovedBy)
                .OnDelete(DeleteBehavior.SetNull);

            // Performance Reviewer
            modelBuilder.Entity<EmployeePerformance>()
                .HasOne(p => p.Reviewer)
                .WithMany(u => u.ReviewsGiven)
                .HasForeignKey(p => p.ReviewedBy)
                .OnDelete(DeleteBehavior.SetNull);

            // Unique indexes
            modelBuilder.Entity<Department>().HasIndex(d => d.Code).IsUnique();
            modelBuilder.Entity<Employee>().HasIndex(e => e.EmployeeCode).IsUnique();
            modelBuilder.Entity<Employee>().HasIndex(e => e.Email).IsUnique();
            modelBuilder.Entity<AuthUser>().HasIndex(u => u.Username).IsUnique();
            modelBuilder.Entity<AuthUser>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Attendance>().HasIndex(a => new { a.EmployeeId, a.AttendanceDate }).IsUnique();
        }
    }

}
