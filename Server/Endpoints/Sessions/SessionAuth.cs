using System.Security.Claims;
using System.Text.Encodings.Web;
using Authentication.Contracts;
using Authentication.Models.Entities;
using Authentication.Services.UserSessions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace Authentication.Endpoints;

public class SessionAuth(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    IUserSessionService sessionService,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Session";

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (IsPublicEndpoint() || !Request.Headers.ContainsKey("Authorization"))
            return AuthenticateResult.NoResult();

        var authHeader = Request.Headers.Authorization[0];

        if (authHeader?.StartsWith(SchemeName) is true)
        {
            var token = authHeader[SchemeName.Length..].Trim();
            UserSession? session = null;

            if (Guid.TryParse(token, out var tokenGuid) &&
                (session = await sessionService.GetSessionByTokenAsync(tokenGuid)) != null)
            {
                var claims = new[]
                {
                    new Claim(ClaimTypes.Authentication,
                        session.AuthorizationToken!.ToString()!),
                    new Claim(ClaimTypes.NameIdentifier,
                        session.License.Username!),
                    new Claim(ClaimTypes.Expiration,
                        session.License.ExpirationDate.ToEpoch().ToString()),
                    new Claim(ClaimTypes.Role,
                        session.CreatedAt.ToLongTimeString())
                };
                var identity = new ClaimsIdentity(claims, SchemeName);
                var principal = new ClaimsPrincipal(identity);
                var ticket = new AuthenticationTicket(principal, SchemeName);

                return AuthenticateResult.Success(ticket);
            }

            Response.StatusCode = 401;
            Response.Headers.Append("WWW-Authenticate", "Basic realm=\"website.com\"");

            return AuthenticateResult.Fail("Invalid Authorization Header");
        }

        Response.StatusCode = 401;
        Response.Headers.Append("WWW-Authenticate", "Basic realm=\"website.com\"");

        return AuthenticateResult.Fail("Invalid Authorization Header");
    }

    private bool IsPublicEndpoint()
    {
        return Context.GetEndpoint()?.Metadata.OfType<AllowAnonymousAttribute>().Any() is null or true;
    }
}