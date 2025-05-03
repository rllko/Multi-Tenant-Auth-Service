using Authentication.AuthenticationHandlers;
using Authentication.Models.Entities;
using Authentication.Services;
using Authentication.Services.Licenses.Sessions;
using FastEndpoints;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.LicenseEndpoints;

public class HwidSetupRequest
{
    [FromForm] public string hwid { get; set; } // complex type to bind from form data
}

public class AddHwidEndpoint(ILicenseSessionService sessionService)
    : Endpoint<HwidSetupRequest, Results<Ok<LicenseSession>, BadRequest<ValidationFailed>>>
{
    public override void Configure()
    {
        AuthSchemes(LicenseSessionAuth.SchemeName);
        Post("protected/session/hwid");
    }

    public override async Task<Results<Ok<LicenseSession>, BadRequest<ValidationFailed>>> ExecuteAsync(
        HwidSetupRequest req,
        CancellationToken ct)
    {
        var session = HttpContext.Items["session"] as LicenseSession;

        var hwidDto = HwidDto.MapFromString(req.hwid);
        if (hwidDto == null)
        {
            var error = new ValidationFailure("error", "invalid hwid");
            return TypedResults.BadRequest(new ValidationFailed(error));
        }

        var result = await sessionService.SetupSessionHwid(session!, hwidDto);

        var match = result.Match<IResult>(
            success =>
                TypedResults.Ok(success),
            error =>
                TypedResults.BadRequest(error)
        );

        return match switch
        {
            Ok<LicenseSession> ok => ok,
            BadRequest<ValidationFailed> bad => bad,
            _ => throw new Exception("Impossible")
        };
    }
}