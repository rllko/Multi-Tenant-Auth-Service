using System.Security.Claims;
using System.Text.Encodings.Web;
using Authentication.Services.Authentication.OAuthAccessToken;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace Authentication.Endpoints;

public class DiscordBasicAuth(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    IAccessTokenStorageService accessTokenStorage,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    internal const string SchemeName = "Auth-Discord";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (IsPublicEndpoint() || !Request.Headers.ContainsKey("Authorization"))
            return Task.FromResult(AuthenticateResult.NoResult());

        var authHeader = Request.Headers.Authorization[0];

        if (authHeader?.StartsWith(SchemeName) is true)
        {
            var token = authHeader[SchemeName.Length..].Trim();

            if (Guid.TryParse(token, out var tokenGuid) && accessTokenStorage.GetByCode(tokenGuid, out var result))
            {
                var claims = new[]
                {
                    new Claim("name", result!.ClientIdentifier!),
                    new Claim(ClaimTypes.Role, "Admin")
                };
                var identity = new ClaimsIdentity(claims, SchemeName);
                var principal = new ClaimsPrincipal(identity);
                var ticket = new AuthenticationTicket(principal, SchemeName);

                return Task.FromResult(AuthenticateResult.Success(ticket));
            }

            Response.StatusCode = 401;
            Response.Headers.Append("WWW-Authenticate", "Basic realm=\"website.com\"");

            return Task.FromResult(AuthenticateResult.Fail("Invalid Authorization Header"));
        }

        Response.StatusCode = 401;
        Response.Headers.Append("WWW-Authenticate", "Basic realm=\"website.com\"");

        return Task.FromResult(AuthenticateResult.Fail("Invalid Authorization Header"));
    }

    private bool IsPublicEndpoint()
    {
        return Context.GetEndpoint()?.Metadata.OfType<AllowAnonymousAttribute>().Any() is null or true;
    }
}