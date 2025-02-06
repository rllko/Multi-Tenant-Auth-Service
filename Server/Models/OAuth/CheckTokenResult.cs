using System.IdentityModel.Tokens.Jwt;

namespace Authentication.Models;

public class CheckTokenResult
{
    public JwtSecurityToken? token { get; init; } = null;
    public bool IsSuccess { get; set; } = false;

    public string? ErrorDescription { get; init; }
}