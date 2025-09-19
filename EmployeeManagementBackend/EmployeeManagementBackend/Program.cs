using EmployeeManagementBackend;
using EmployeeManagementBackend.Models;
using EmployeeManagementBackend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.AllowAnyOrigin()
            //WithOrigins("*")
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

builder.Services.AddSwaggerGen(options =>
{
    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
        Description = "Enter your JWT Access Token",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    options.AddSecurityDefinition("Bearer", jwtSecurityScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {jwtSecurityScheme, Array.Empty<string>() }
    });
});

// Add DbContext
//builder.Services.AddDbContext<EmployeeManagementContext>(options =>
//    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDbContext<EmployeeManagementContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    ));

//var jwtSettings = new JwtSettings();
//builder.Configuration.GetSection("JwtSettings").Bind(jwtSettings);
//builder.Services.AddSingleton(jwtSettings);

// JWT settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddSingleton<ITokenService, TokenService>();

// Password Service
builder.Services.AddScoped<IPasswordService, PasswordService>();

// Excel Report Service
builder.Services.AddScoped<IExcelReportService, ExcelReportService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
    //.AddJwtBearer(options =>
    //{
    //    var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

    //    // Make sure we have the secret
    //    if (string.IsNullOrEmpty(jwtSettings?.Secret))
    //    {
    //        throw new InvalidOperationException("JWT Secret is not configured properly");
    //    }

    //    Console.WriteLine($"JWT Secret length: {jwtSettings.Secret.Length}");
    //    Console.WriteLine($"JWT Issuer: {jwtSettings.Issuer}");
    //    Console.WriteLine($"JWT Audience: {jwtSettings.Audience}");

    //    options.TokenValidationParameters = new TokenValidationParameters
    //    {
    //        ValidateIssuerSigningKey = true,
    //        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
    //        ValidateIssuer = true,
    //        ValidIssuer = jwtSettings.Issuer,
    //        ValidateAudience = true,
    //        ValidAudience = jwtSettings.Audience,
    //        RequireExpirationTime = true,
    //        ValidateLifetime = true,
    //        ClockSkew = TimeSpan.Zero
    //    };

    //    // Explicitly set these options to ensure proper token handling
    //    options.SaveToken = true;
    //    options.RequireHttpsMetadata = false;
    //    options.IncludeErrorDetails = true; // Add detailed error information

    //    options.Events = new JwtBearerEvents
    //    {
    //        OnMessageReceived = context =>
    //        {
    //            try
    //            {
    //                // Get the Authorization header
    //                var authHeader = context.Request.Headers["Authorization"].ToString();
    //                Console.WriteLine("Raw Authorization header: " + authHeader);

    //                // Extract token from Authorization header
    //                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
    //                {
    //                    // Extract token and ensure it's properly formatted
    //                    var token = authHeader.Substring(7).Trim(); // "Bearer ".Length = 7

    //                    // Validate token format (should have 2 dots)
    //                    var parts = token.Split('.');
    //                    Console.WriteLine($"Token parts count: {parts.Length}");

    //                    if (parts.Length == 3)
    //                    {
    //                        Console.WriteLine($"Token from header (length: {token.Length}): {token}");
    //                        Console.WriteLine($"Header part length: {parts[0].Length}");
    //                        Console.WriteLine($"Payload part length: {parts[1].Length}");
    //                        Console.WriteLine($"Signature part length: {parts[2].Length}");

    //                        // Set the token for the middleware to use
    //                        context.Token = token;
    //                    }
    //                    else
    //                    {
    //                        Console.WriteLine("Invalid token format: does not contain exactly 3 parts");
    //                    }
    //                }

    //                // Check for token in query string (for SignalR)
    //                var accessToken = context.Request.Query["access_token"];
    //                if (!string.IsNullOrEmpty(accessToken))
    //                {
    //                    Console.WriteLine("Using token from query string");
    //                    context.Token = accessToken;
    //                }
    //            }
    //            catch (Exception ex)
    //            {
    //                Console.WriteLine($"Error in OnMessageReceived: {ex.Message}");
    //            }

    //            return Task.CompletedTask;
    //        },
    //        OnAuthenticationFailed = context =>
    //        {
    //            Console.WriteLine("Authentication failed: " + context.Exception.Message);
    //            Console.WriteLine("Exception type: " + context.Exception.GetType().Name);

    //            if (context.Exception.InnerException != null)
    //            {
    //                Console.WriteLine("Inner exception: " + context.Exception.InnerException.Message);
    //                Console.WriteLine("Inner exception type: " + context.Exception.InnerException.GetType().Name);
    //            }

    //            // Check if token is present in the request
    //            Console.WriteLine("Token in context: " + (context.Request.Headers.ContainsKey("Authorization") ? "Yes" : "No"));

    //            return Task.CompletedTask;
    //        },
    //        OnTokenValidated = context =>
    //        {
    //            Console.WriteLine("Token validated successfully.");
    //            return Task.CompletedTask;
    //        }
    //    };
    //});
    .AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowSpecificOrigin");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
