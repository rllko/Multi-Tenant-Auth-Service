using HeadHunter.Models.Entities;
using HeadHunter.Services.CodeService;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

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
            context.Request.Headers.TryGetValue("Authorization", out var authHeader);
            authHeader = authHeader.Select(u => u.Split(" ") [1]).FirstOrDefault();

            if(string.IsNullOrEmpty(authHeader))
            {
                await _next(context);
            }

            // obtain code from database
            var authorizationCode = _acessTokenStorageService.GetByCode(authHeader);

            if(authorizationCode == null)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync("Invalid Token");
                return;
            }

            // create token handler
            var handler = new JwtSecurityTokenHandler();
            var key = new RsaSecurityKey(_devKeys.RsaKey);

            // create authentication token from valid code
            var token = new JwtSecurityToken(
                issuer:IdentityData.Issuer,
                audience:IdentityData.Audience,
                claims:
                [..
                    authorizationCode.RequestedScopes.Select(u => new Claim("scope", u)),
                    new Claim("sub",authorizationCode.Subject),
                    new Claim("client_id",authorizationCode.ClientIdentifier),
                    new Claim("jti",authHeader!),
                    new Claim("jti_created_at",authorizationCode.CreationTime.ToString())
                  ],
                notBefore:DateTime.Now,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.RsaSha256));

            // sign token
            var tokenstr = handler.WriteToken(token);

            // insert token into request
            context.Request.Headers ["Authorization"] = $"{tokenstr}";

            // Permission handling is taken care by each endpoint
            await _next(context);
        }
    }
}
