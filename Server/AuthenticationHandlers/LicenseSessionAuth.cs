using System.Security.Claims;
using System.Text.Encodings.Web;
using Authentication.Models.Entities;
using Authentication.Services.Licenses.Sessions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace Authentication.AuthenticationHandlers;

public class LicenseSessionAuth(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    ILicenseSessionService sessionService,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Session";

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (IsPublicEndpoint() || !Request.Headers.ContainsKey("Authorization"))
            return AuthenticateResult.NoResult();

        var authHeader = Request.Headers.Authorization[0];

        if (authHeader?.StartsWith(SchemeName) is not true)
        {
            Response.StatusCode = 401;
            Response.Headers.Append("WWW-Authenticate", "Basic realm=\"website.com\"");
            return AuthenticateResult.Fail("Invalid Authorization Header");
        }

        var token = authHeader[SchemeName.Length..].Trim();
        if (Guid.TryParse(token, out var tokenGuid) is false)
        {
            Response.StatusCode = 401;
            Response.Headers.Append("WWW-Authenticate", "Basic realm=\"website.com\"");
            return AuthenticateResult.Fail("Invalid Authorization Header");
        }

        var session = await sessionService.GetSessionByTokenAsync(tokenGuid);
        var validationFailure = ValidateSession(session);
        if (validationFailure is not null)
        {
            Response.StatusCode = 401;
            return AuthenticateResult.Fail(validationFailure);
        }

        Context.Items["Session"] = session;
        Context.Items["session"] = session;

        var claims = new[]
        {
            new Claim(ClaimTypes.Authentication, session!.AuthorizationToken!.ToString()!),
            new Claim("session-token", session.AuthorizationToken!.ToString()!),
            new Claim(ClaimTypes.NameIdentifier, session.License.Username ?? string.Empty),
            new Claim(ClaimTypes.Expiration, session.License.ExpiresAt.ToString()),
            new Claim(ClaimTypes.Role, session.CreatedAt.ToString())
        };
        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);

        return AuthenticateResult.Success(ticket);
    }

    private static string? ValidateSession(LicenseSession? session)
    {
        if (session is null) return "Session not found";
        if (session.Active is false) return "Session is inactive";
        if (session.License is null) return "License not found";
        if (session.License.Paused) return "License is paused";
        if (session.License.Banned) return "License is banned";
        if (session.License.Revoked) return "License is revoked";

        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        if (session.License.ExpiresAt <= now) return "License is expired";
        if (session.RefreshedAt is not null && now - session.RefreshedAt > 86_400) return "Session is stale";

        return null;
    }

    private bool IsPublicEndpoint()
    {
        return Context.GetEndpoint()?.Metadata.OfType<AllowAnonymousAttribute>().Any() is null or true;
    }
}
