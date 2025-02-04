using System.IdentityModel.Tokens.Jwt;

namespace HeadHunter.Models
{
    public class CheckTokenResult
    {
        public JwtSecurityToken? token { get; init; } = null;
        public bool IsSuccess { get; set; } = false;

        public string? ErrorDescription { get; init; }
    }
}
