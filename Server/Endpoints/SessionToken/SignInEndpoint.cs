using Authentication.Services;
using Authentication.Services.UserSessions;
using FastEndpoints;
using FastEndpoints.Security;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.SessionToken;

public class SignInEndpoint(
    IUserSessionService sessionService)
    : Endpoint<SignInRequest, Results<Ok<string>, BadRequest<ValidationFailed>>>
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

    public override async Task<Results<Ok<string>, BadRequest<ValidationFailed>>> ExecuteAsync(SignInRequest req,
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
                        o.ExpireAt = DateTimeOffset.FromUnixTimeSeconds((long)se.RefreshedAt).Date;
                        o.User["session-token"] = se.AuthorizationToken.ToString()!;
                        o.User["username"] = se.License.Username;
                        o.User["license-expiration"] = se.License.ExpirationDate.ToString();
                        o.User["hwid-id"] = se.HwidId.ToString();
                    });
                return TypedResults.Ok(jwt);
            },
            error => TypedResults.BadRequest(error));

        return result switch
        {
            Ok<string> ok => ok,
            BadRequest<ValidationFailed> fail => fail,
            _ => throw new Exception("Impossible")
        };
    }
}