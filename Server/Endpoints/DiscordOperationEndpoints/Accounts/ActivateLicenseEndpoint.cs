using Authentication.Common;
using Authentication.Models.Entities;
using Authentication.Services;
using Authentication.Services.Discords;
using Authentication.Services.Licenses;
using FastEndpoints;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.DiscordOperations.Accounts;

public class ActivateLicenseEndpoint(
    IDiscordService discordService,
    ILicenseService licenseService,
    IValidator<ActivateLicenseRequest> validator)
    : Endpoint<ActivateLicenseRequest, Results<Ok<LicenseDto>, BadRequest<ValidationFailed>>>
{
    public override void Configure()
    {
        AuthSchemes(DiscordBasicAuth.SchemeName);
        Post("/protected/licenses/activate");
    }

    public override async Task<Results<Ok<LicenseDto>, BadRequest<ValidationFailed>>> ExecuteAsync(
        ActivateLicenseRequest req, CancellationToken ct)
    {
        var validationResult = await validator.ValidateAsync(req, ct);

        if (!validationResult.IsValid)
        {
            var errors = new ValidationFailed(validationResult.Errors);
            return TypedResults.BadRequest(errors);
        }

        var existingDiscord = await discordService.GetByIdAsync(req.DiscordId) ??
                              await discordService.CreateUserAsync(req.DiscordId);

        var licenseValue = Guider.ToGuidFromString(req.LicenseValue);

        var key = await licenseService
            .ActivateLicense(licenseValue, req.Username!, req.Password!, req.Email!, req.DiscordId);

        var response = key.Match<IResult>(
            authResponse => TypedResults.Ok(authResponse),
            failed => TypedResults.BadRequest(failed));

        return response switch
        {
            Ok<LicenseDto> success => success,
            BadRequest<ValidationFailed> badRequest => badRequest,
            _ => throw new Exception("Impossible")
        };
    }
}

public record ActivateLicenseRequest(
    string LicenseValue,
    long DiscordId,
    string? Username,
    string? Email,
    string? Password);