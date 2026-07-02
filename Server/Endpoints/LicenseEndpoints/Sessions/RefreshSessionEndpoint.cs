using Authentication.HostedServices;
using Authentication.Models.Entities;
using Authentication.Services;
using Authentication.Services.Licenses.Sessions;
using FastEndpoints;
using FastEndpoints.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.LicenseEndpoints.Sessions;

internal class RefreshSessionEndpoint(ILicenseSessionService sessionService)
    : EndpointWithoutRequest<Results<Ok<string>, BadRequest<ValidationFailed>>>
{
    public override void Configure()
    {
        Put("/sessions/");
        AuthSchemes(JwtBearerDefaults.AuthenticationScheme);
        Throttle(
            20,
            60
        );
    
        Summary(s =>
        {
            s.Summary = "Refresh a license session";
            s.Description = "Extends the current end-user license session and rotates its token.";
            s.Response(200, "Refreshed session with rotated token");
            s.Response<ErrorResponse>(400, "Session invalid or expired");
        });
    }

    public override async Task<Results<Ok<string>, BadRequest<ValidationFailed>>> ExecuteAsync(
        CancellationToken ct)
    {
        var sess = HttpContext.Items["Session"] as LicenseSession;

        var session = await sessionService.RefreshLicenseSession(sess!);

        var result = session.Match<IResult>(
            se =>
                TypedResults.Ok(JwtBearer.CreateToken(o =>
                {
                    o.SigningKey = Environment.GetEnvironmentVariable(EnvironmentVariableService.SignKeyName)!;
                    o.ExpireAt = DateTime.UtcNow.AddDays(1);
                    o.User["session-token"] = se.AuthorizationToken.ToString()!;
                    o.User["username"] = se.License.Username!;
                    o.User["license-expiration"] = se.License.ExpiresAt.ToString();
                })),
            TypedResults.BadRequest);

        return result switch
        {
            Ok<string> ok => ok,
            BadRequest<ValidationFailed> fail => fail,
            _ => throw new Exception("Impossible")
        };
    }
}