using Authentication.Models.Entities;

namespace Authentication.Endpoints.Sessions;

public record CreateSessionRequest
{
    public HwidDto? Hwid { get; set; }
    public required string HwidStr { get; set; }
    public required string Username { get; set; }
    public required string Password { get; set; }
}