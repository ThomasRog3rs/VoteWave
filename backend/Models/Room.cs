using System.Collections.Generic;

namespace QuizApi.Models;

public enum RoomState { Lobby, Question, Results, Finished }

public class Player
{
    public required string Username { get; set; }
    public required string ConnectionId { get; set; }
}

public class QuestionSnapshot
{
    public int Id { get; set; }
    public required string Text { get; set; }
    public List<string> Choices { get; set; } = new();
    public int CorrectIndex { get; set; }
}

public class Room
{
    public required string Code { get; set; }
    public int QuizId { get; set; }
    public required string QuizTitle { get; set; }
    public required string HostUsername { get; set; }
    public RoomState State { get; set; } = RoomState.Lobby;
    public List<Player> Players { get; set; } = new();
    public List<QuestionSnapshot> Questions { get; set; } = new();
    public int CurrentQuestionIndex { get; set; } = 0;
    public Dictionary<string, int> Answers { get; set; } = new();
    public Dictionary<string, int> Scores { get; set; } = new();
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

public record CreateRoomRequest(int QuizId, string HostUsername);

public record RoomInfo(
    string Code,
    int QuizId,
    string QuizTitle,
    string HostUsername,
    string State,
    List<string> Players
);

public record QuestionDto(
    int Id,
    string Text,
    List<string> Choices,
    int QuestionIndex,
    int TotalQuestions
);

public record PlayerAnswer(string Username, int ChoiceIndex, bool Correct);

public record RevealResultDto(
    int CorrectIndex,
    List<PlayerAnswer> Answers,
    Dictionary<string, int> Scores
);

public record ScoreEntry(string Username, int Score);
