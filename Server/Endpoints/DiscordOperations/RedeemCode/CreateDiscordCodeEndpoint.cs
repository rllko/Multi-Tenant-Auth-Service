using Authentication.Common;
using Authentication.Services.Licenses;
using Authentication.Services.Licenses.Builder;
using FastEndpoints;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.DiscordOperations.RedeemCode;

public class CreateDiscordCodeEndpoint(ILicenseBuilder licenseBuilder, ILicenseService licenseService)
    : Endpoint<Result<Ok, ValidationFailed>>
{
    public override void Configure()
    {
#warning add authentication
        AllowFormData();
        Post("/protected/redeem-code");
    }


    public override async Task<Result<Ok, BadRequest<ValidationFailed>>> HandleAsync(Result<Ok, ValidationFailed> req,
        CancellationToken ct)
    {
        if (HttpContext.Request.Form.TryGetValue("license", out var licenseValue) is false)
        {
            await SendUnauthorizedAsync(ct);
            var error = new ValidationFailure("error", "Invalid license ID");
            return TypedResults.BadRequest(new ValidationFailed(error));
        }

        var actualValue = Guider.ToGuidFromString(licenseValue.ToString());

        var user = await licenseService.GetLicenseByValueAsync(actualValue);

        if (user == null)
        {
            var error = new ValidationFailure("error", "Invalid license ID");
            return TypedResults.BadRequest(new ValidationFailed(error));
        }

        if (user.Discord != null)
        {
            var error = new ValidationFailure("error",
                "Key is already confirmed.");
            return TypedResults.BadRequest(new ValidationFailed(error));
        }

        var discordCode = await licenseBuilder.CreateLicenseRegistrationCodeAsync(user);

        var response = discordCode.Match<IResult>(
            code => TypedResults.Ok(code),
            fail => TypedResults.BadRequest(fail.Errors));

        return response switch
        {
            Ok result => result,
            BadRequest<ValidationFailed> badRequest => badRequest,
            _ => throw new NotImplementedException()
        };
    }
}