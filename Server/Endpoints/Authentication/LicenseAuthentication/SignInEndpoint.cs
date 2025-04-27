using Authentication.Services;
using Authentication.Services.UserSessions;
using FastEndpoints;
using FastEndpoints.Security;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.SessionToken;

public class SignInEndpoint(
    ILicenseSessionService sessionService)
    : Endpoint<SignInRequest, Results<JsonHttpResult<string>, BadRequest<ValidationFailed>>>
{
    public override void Configure()
    {
        //  AllowFormData();
        AllowAnonymous();
        Throttle(
            10,
            60
        );
        Post("auth/license/login");
    }

    public override async Task<Results<JsonHttpResult<string>, BadRequest<ValidationFailed>>> ExecuteAsync(
        SignInRequest req,
        CancellationToken ct)
    {
        var session = await sessionService.CreateSessionWithTokenAsync(req);
        var result = session.Match<IResult>(
            se =>
            {
                var jwt = JwtBearer.CreateToken(
                    o =>
                    {
                        o.SigningKey = Environment.GetEnvironmentVariable("SYM_KEY")!;
                        o.SigningStyle = TokenSigningStyle.Symmetric;
                        o.SigningAlgorithm = "HS256";
                        o.ExpireAt = DateTimeOffset.FromUnixTimeSeconds((long)se.RefreshedAt).AddDays(1).Date;
                        o.User["session-token"] = se.AuthorizationToken.ToString()!;
                        o.User["username"] = se.License.Username;
                        o.User["license-expiration"] = se.License.ExpiresAt.ToString();
                        o.User["hwid-id"] = se.HwidId.ToString();
                    });
                return TypedResults.Json(jwt);
            },
            error => TypedResults.BadRequest(error));

        return result switch
        {
            JsonHttpResult<string> ok => ok,
            BadRequest<ValidationFailed> fail => fail,
            _ => throw new Exception("Impossible")
        };
    }
}