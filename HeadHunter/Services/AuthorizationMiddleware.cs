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
            context.Request.Headers.TryGetValue("Authorization", out var authHeader);

            authHeader = authHeader.Select(u => u.Split(" ") [1]).FirstOrDefault();

            var authorizationCode = _acessTokenStorageService.GetByCode(authHeader);

            if(authorizationCode == null)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Unauthorized");
                return;
            }

            ;

            var handler = new JwtSecurityTokenHandler();
            var key = new RsaSecurityKey(_devKeys.RsaKey);
            var token = new JwtSecurityToken(
                issuer:IdentityData.Issuer,
                audience:IdentityData.Audience,
                claims:authorizationCode.RequestedScopes.Select(u => new Claim("scope", u)),
                notBefore:DateTime.Now,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.RsaSha256));

            var tokenstr = handler.WriteToken(token);

            context.Request.Headers ["Authorization"] = $"{tokenstr}";

            //context.Response.OnStarting(() =>
            //{
            //    return Task.CompletedTask;
            //});

            await _next(context);
        }
    }
}
