using System.Security.Claims;
using System.Text.Encodings.Web;
using Authentication.Models.Entities;
using Authentication.Services.Licenses.Sessions;
using FluentValidation.Results;
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
    private const int SessionRefreshLifetimeInDays = 1;

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (IsPublicEndpoint() || !Request.Headers.ContainsKey("Authorization"))
            return AuthenticateResult.NoResult();

        var authHeader = Request.Headers.Authorization[0];

        if (authHeader?.StartsWith(SchemeName) is true)
        {
            var token = authHeader[SchemeName.Length..].Trim();
            LicenseSession? session = null;

            if (Guid.TryParse(token, out var tokenGuid) &&
                (session = await sessionService.GetSessionByTokenAsync(tokenGuid)) != null)
            {
                if (session.Active is false ||
                    session.License is null ||
                    session.License.Paused ||
                    session.License.Banned ||
                    session.License.Revoked ||
                    session.License.ExpiresAt <= DateTimeOffset.UtcNow.ToUnixTimeSeconds() ||
                    (session.RefreshedAt != null && DateTimeOffset.UtcNow.ToUnixTimeSeconds() > DateTimeOffset
                        .FromUnixTimeSeconds((long)session.RefreshedAt)
                        .AddDays(SessionRefreshLifetimeInDays).ToUnixTimeSeconds()))
                {
                    Response.StatusCode = 401;
                    var error = new ValidationFailure("error", "Session could not be created");
                    return AuthenticateResult.Fail(error.ErrorMessage);
                }

                Context.Items["session"] = session;

                var claims = new[]
                {
                    new Claim(ClaimTypes.Authentication,
                        session.AuthorizationToken!.ToString()!),
                    new Claim(ClaimTypes.NameIdentifier,
                        session.License.Username!),
                    new Claim(ClaimTypes.Expiration,
                        session.License.ExpiresAt.ToString()),
                    new Claim(ClaimTypes.Role,
                        session.CreatedAt.ToString())
                };
                var identity = new ClaimsIdentity(claims, SchemeName);
                var principal = new ClaimsPrincipal(identity);
                var ticket = new AuthenticationTicket(principal, SchemeName);

                return AuthenticateResult.Success(ticket);
            }
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
