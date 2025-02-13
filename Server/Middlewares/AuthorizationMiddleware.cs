using System.IdentityModel.Tokens.Jwt;
using Authentication.Endpoints.DiscordOperations;
using Authentication.Services.CodeService;
using Microsoft.IdentityModel.Tokens;

namespace Authentication.Services;

public class AuthorizationMiddleware
{
    private readonly IAcessTokenStorageService _acessTokenStorageService;
    private readonly DevKeys _devKeys;
    private readonly RequestDelegate _next;

    public AuthorizationMiddleware(RequestDelegate next, IAcessTokenStorageService acessTokenStorageService,
        DevKeys devKeys)
    {
        _next = next;
        _acessTokenStorageService = acessTokenStorageService;
        _devKeys = devKeys;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // extract guid token form from header
        var access_token = context.Request.Headers.Authorization;

        if (string.IsNullOrEmpty(access_token)) await _next(context);


        var codeUsed = access_token.ToString().Split(" ")[1];

        // obtain code from database
        var authorizationCode = _acessTokenStorageService.GetByCode(Guid.Parse(codeUsed));

        if (authorizationCode == null)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(
                new DiscordResponse<string> { Error = "Invalid AuthorizationToken" });
            return;
        }

        // create token handler
        var handler = new JwtSecurityTokenHandler();
        var key = new RsaSecurityKey(_devKeys.RsaSignKey);

        var token2 = new SecurityTokenDescriptor
        {
            Expires = DateTime.Now.AddMinutes(30),
            NotBefore = DateTime.Now,
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.RsaSha256),
            Claims = new Dictionary<string, object>
            {
                ["Scope"] = authorizationCode.RequestedScopes!.Select(u => u).ToList(),
                ["sub"] = authorizationCode.Subject,
                ["ClientId"] = authorizationCode.ClientIdentifier!,
                ["jti"] = codeUsed,
                ["jti_created_at"] = authorizationCode.CreationTime
            }
        };

        // sign token
        var tokenstr = handler.CreateJwtSecurityToken(token2);

        // insert token into request
        context.Request.Headers["Authorization"] = $"{handler.WriteToken(tokenstr)}";

        // Permission handling is taken care by each endpoint
        await _next(context);
    }
}