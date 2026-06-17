using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace QuizApi.Models;

public class Quiz
{
    [Key]
    public int Id { get; set; }
    public required string Title { get; set; }
    public List<Question> Questions { get; set; } = new();
}

public class Question
{
    [Key]
    public int Id { get; set; }
    public required string Text { get; set; }
    public List<Choice> Choices { get; set; } = new();
    public int CorrectIndex { get; set; }
}

public class Choice
{
    [Key]
    public int Id { get; set; }
    public required string Text { get; set; }
}

public class QuizDbContext : DbContext
{
    public QuizDbContext(DbContextOptions<QuizDbContext> opts) : base(opts) { }
    public DbSet<Quiz> Quizzes { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Choice> Choices { get; set; }
}
