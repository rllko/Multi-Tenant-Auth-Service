using System.Security.Claims;
using System.Text.Encodings.Web;
using Authentication.Models.Entities;
using Authentication.Services.UserSessions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace Authentication.Endpoints.Sessions;

public class SessionAuth(
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

        if (authHeader?.StartsWith(SchemeName) is true)
        {
            var token = authHeader[SchemeName.Length..].Trim();
            LicenseSession? session = null;

            // if (session.Active is false)
            // {
            /*var error = new ValidationFailure(
                "session_inactive",
                "This session is not active, try logging in again");
            return new ValidationFailed(error);
        }

        if (session.License.Paused)
        {
            var error = new ValidationFailure("license_paused",
                "This license is paused, contact support for more info.");
        }

        // if it was created more than one day ago, refresh
        if (DateTimeOffset.Now.ToUnixTimeSeconds() > session.RefreshedAt)
        {
            var error = new ValidationFailure("error", "Session could not be created");
            return new ValidationFailed(error);
        }*/

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
                        session.License.ExpiresAt.ToString()),
                    new Claim(ClaimTypes.Role,
                        session.CreatedAt.ToString())
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