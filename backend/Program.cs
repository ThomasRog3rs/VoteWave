using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using QuizApi.Hubs;
using QuizApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins(
            "http://localhost:3000",
            "http://localhost:5173"));
});

builder.Services.AddSignalR();
builder.Services.AddControllers();
builder.Services.AddDbContext<QuizDbContext>(opt => opt.UseSqlite("Data Source=quizzes.db"));

var app = builder.Build();

app.UseCors();
app.MapControllers();
app.MapHub<QuizHub>("/hub/quiz");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<QuizDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
