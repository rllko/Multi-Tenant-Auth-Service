using Authentication.Services;
using Authentication.Services.UserSessions;
using FastEndpoints;
using FastEndpoints.Security;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.SessionToken;

public class SignInEndpoint(
    IUserSessionService sessionService)
    : Endpoint<SignInRequest, Result<string, ValidationFailed>>
{
    public override void Configure()
    {
        //  AllowFormData();
        AllowAnonymous();
        Throttle(
            10,
            60
        );
        Post("/sign-in");
    }

    public override async Task<Results<Ok<string>, BadRequest<ValidationFailed>>> HandleAsync(SignInRequest req,
        CancellationToken ct)
    {
        var session = await sessionService.CreateSessionWithTokenAsync(req);
        var result = session.Match<IResult>(
            se =>
                TypedResults.Ok(JwtBearer.CreateToken(
                    o =>
                    {
                        o.ExpireAt = DateTimeOffset.FromUnixTimeSeconds(se.ExpiresAt).Date;
                        o.User["session-token"] = se.AuthorizationToken.ToString()!;
                        o.User["username"] = se.License.Username!;
                        o.User["license-expiration"] = se.License.ExpirationDate.ToString();
                        o.User["hwid-id"] = se.HwidId.ToString();
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