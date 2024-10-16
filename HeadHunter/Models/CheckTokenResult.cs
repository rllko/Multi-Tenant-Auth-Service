using System.IdentityModel.Tokens.Jwt;

namespace HeadHunter.Models
{
    public class CheckTokenResult
    {
        public JwtSecurityToken token { get; init; }
        public bool IsSuccess { get; set; } = false;

        public string? ErrorDescription { get; init; }
    }
}
