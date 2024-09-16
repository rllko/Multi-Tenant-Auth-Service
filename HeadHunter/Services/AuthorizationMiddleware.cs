using HeadHunter.Common;
using HeadHunter.Services.CodeService;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace HeadHunter.Services
{
    public class AuthorizationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IAcessTokenStorageService _acessTokenStorageService;
        private readonly DevKeys _devKeys;

        public AuthorizationMiddleware(RequestDelegate next, IAcessTokenStorageService acessTokenStorageService, DevKeys devKeys)
        {
            _next = next;
            _acessTokenStorageService = acessTokenStorageService;
            _devKeys = devKeys;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // extract guid token form from header
            string access_token = context.Request.Headers["Authorization"]!;

            if(string.IsNullOrEmpty(access_token))
            {
                await _next(context);
            }

            var codeUsed = access_token.Split(" ")[1];

            // obtain code from database
            var authorizationCode = _acessTokenStorageService.GetByCode(codeUsed);

            if(authorizationCode == null)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync("Invalid Token");
                return;
            }

            // create token handler
            var handler = new JwtSecurityTokenHandler();
            var key = new RsaSecurityKey(_devKeys.RsaSignKey);

            var token2 = new SecurityTokenDescriptor
            {
                Audience = IdentityData.Audience,
                Issuer = IdentityData.Issuer,
                Expires = DateTime.Now.AddMinutes(30),
                NotBefore = DateTime.Now,
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.RsaSha256),
                Claims = new Dictionary<string,object>()
                {
                    ["scope"] = authorizationCode.RequestedScopes.Select(u => u).ToList(),
                    ["sub"] = authorizationCode.Subject,
                    ["client_id"] =  authorizationCode.ClientIdentifier,
                    ["jti"] = codeUsed,
                    ["jti_created_at"] = authorizationCode.CreationTime.ToString()
                }
            };

            // sign token
            var tokenstr = handler.CreateJwtSecurityToken(token2); ;

            // insert token into request
            context.Request.Headers ["Authorization"] = $"{handler.WriteToken(tokenstr)}";

            // Permission handling is taken care by each endpoint
            await _next(context);
        }
    }
}
