using Authentication.Models.Entities;
using Authentication.Services;
using Authentication.Services.UserSessions;
using FastEndpoints;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.Sessions;

public class HwidSetupRequest
{
    [FromForm] public string hwid { get; set; } // complex type to bind from form data
}

public class AddHwidEndpoint(IUserSessionService sessionService)
    : Endpoint<HwidSetupRequest, Results<Ok<UserSession>, BadRequest<ValidationFailed>>>
{
    public override void Configure()
    {
        AuthSchemes(SessionAuth.SchemeName);
        Post("protected/session/hwid");
    }

    public override async Task<Results<Ok<UserSession>, BadRequest<ValidationFailed>>> ExecuteAsync(
        HwidSetupRequest req,
        CancellationToken ct)
    {
        var session = HttpContext.Items["session"] as UserSession;

        var hwidDto = HwidDto.MapFromString(req.hwid);
        if (hwidDto == null)
        {
            var error = new ValidationFailure("error", "invalid hwid");
            return TypedResults.BadRequest(new ValidationFailed(error));
        }

        var result = await sessionService.SetupSessionHwid(session, hwidDto);

        var match = result.Match<IResult>(
            success =>
                TypedResults.Ok(success),
            error =>
                TypedResults.BadRequest(error)
        );

        return match switch
        {
            Ok<UserSession> ok => ok,
            BadRequest<ValidationFailed> bad => bad,
            _ => throw new Exception("Impossible")
        };
    }
}