using Authentication.Models.Entities;
using Authentication.Services;
using Authentication.Services.Licenses.Accounts;
using Authentication.Services.UserSessions;
using FastEndpoints;
using FastEndpoints.Security;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.Sessions;

public class CreateSessionEndpoint(
    IAccountService accountService,
    IUserSessionService sessionService)
    : Endpoint<CreateSessionRequest, Result<string, ValidationFailed>>
{
    public override void Configure()
    {
        AllowFormData();
        AllowAnonymous();
        Post("/sessions");
    }

    public override async Task<Results<Ok<string>, BadRequest<ValidationFailed>>> HandleAsync(CreateSessionRequest req,
        CancellationToken ct)
    {
        var filteredInput = req.HwidStr.Split('+').ToList();

        if (filteredInput.Count is not 5)
        {
            var error = new ValidationFailure("error", "Invalid HWID Size");
            return TypedResults.BadRequest(new ValidationFailed(error));
        }

        foreach (var item in filteredInput)
            if (item!.Length is not 64)
            {
                var error = new ValidationFailure("error", "Invalid HWID Format");
                return TypedResults.BadRequest(new ValidationFailed(error));
            }

        req.Hwid = new HwidDto(filteredInput[0], filteredInput[1], filteredInput[2],
            filteredInput[3], filteredInput[4]);

        var session = await sessionService.CreateSessionAsync(req);
        var result = session.Match<IResult>(
            se =>
                TypedResults.Ok(JwtBearer.CreateToken(
                    o =>
                    {
                        o.ExpireAt = DateTime.UtcNow.AddDays(1);
                        o.User["session-token"] = se.AuthorizationToken.ToString()!;
                        o.User["username"] = se.License.Username!;
                        o.User["license-expiration"] = se.License.ExpirationDate.ToString();
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