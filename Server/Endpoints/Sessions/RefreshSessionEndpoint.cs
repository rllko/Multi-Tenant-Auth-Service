using Authentication.Contracts;
using Authentication.Services;
using Authentication.Services.UserSessions;
using FastEndpoints;
using FastEndpoints.Security;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.Sessions;

internal class RefreshSessionEndpoint(IUserSessionService sessionService)
    : EndpointWithoutRequest<Results<Ok<string>, BadRequest<ValidationFailed>>>
{
    public override void Configure()
    {
        Put("/session/{id}");
        AuthSchemes(JwtBearerDefaults.AuthenticationScheme);
    }

    public override async Task<Results<Ok<string>, BadRequest<ValidationFailed>>> ExecuteAsync(
        CancellationToken ct)
    {
        var tokenStr = User.Claims.FirstOrDefault(c => c.Type == "session-token")?.Value;

        if (string.IsNullOrWhiteSpace(tokenStr) || Guid.TryParse(tokenStr!, out var tokenGuid) is false)
        {
            var error = new ValidationFailure("error", "Invalid session token");
            return TypedResults.BadRequest(new ValidationFailed(error));
        }

#warning change from session token to session id
        var session = await sessionService.RefreshLicenseSession(tokenGuid);

        var result = session.Match<IResult>(
            se =>
                TypedResults.Ok(JwtBearer.CreateToken(
                    o =>
                    {
                        o.ExpireAt = DateTime.UtcNow.AddDays(1);
                        o.User["session-token"] = se.AuthorizationToken.ToString()!;
                        o.User["username"] = se.License.Username!;
                        o.User["license-expiration"] = se.License.ExpirationDate.ToEpoch().ToString();
                    })),
            error => TypedResults.BadRequest(error));

        return result switch
        {
            Ok<string> ok => ok,
            BadRequest<ValidationFailed> fail => fail,
            _ => throw new Exception("Impossible")
        };
    }
}