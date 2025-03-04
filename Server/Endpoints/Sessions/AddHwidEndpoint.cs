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
        var sessionToken = User.Claims.FirstOrDefault(c => c.Type == "session-token")?.Value;

        if (string.IsNullOrWhiteSpace(sessionToken) || !Guid.TryParse(sessionToken, out var sessionTokenGuid))
        {
            var error = new ValidationFailure("error", "invalid session token");
            return TypedResults.BadRequest(new ValidationFailed(error));
        }

        var hwidDto = HwidDto.MapFromString(req.hwid);
#warning you really need to validate either here or in MapFromString
        if (hwidDto == null)
        {
            var error = new ValidationFailure("error", "invalid hwid");
            return TypedResults.BadRequest(new ValidationFailed(error));
        }

        var result = await sessionService.SetupSessionHwid(sessionTokenGuid, hwidDto);

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