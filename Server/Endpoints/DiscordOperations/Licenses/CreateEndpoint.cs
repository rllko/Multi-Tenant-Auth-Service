using Authentication.Contracts;
using Authentication.Models.Entities;
using Authentication.Services.Discords;
using Authentication.Services.Licenses.Builder;
using FastEndpoints;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.DiscordOperations.Licenses;

internal class CreateEndpoint(ILicenseBuilder licenseBuilder, IDiscordService discordService)
    : Endpoint<CreateEndpoint.CreateLicenseRequest, Results<Ok<LicenseDto>, BadRequest>>
{
    public override void Configure()
    {
        AuthSchemes(DiscordBasicAuth.SchemeName);
        Post("/protected/licenses/{discordId}");
    }

    public override async Task<Results<Ok<LicenseDto>, BadRequest>> ExecuteAsync(
        CreateLicenseRequest req, CancellationToken ct)
    {
        var existingDiscord = await discordService.GetByIdAsync(req.DiscordId) ??
                              await discordService.CreateUserAsync(req.DiscordId);

        var key = await licenseBuilder.CreateLicenseAsync(req.LicenseExpirationInDays,
            existingDiscord?.DiscordId ?? null,
            req.Username,
            req.Email,
            req.Password);

        var response = key.Match<IResult>(
            authResponse => TypedResults.Ok(authResponse.MapToDto()),
            failed => TypedResults.BadRequest(failed));

        return response switch
        {
            Ok<LicenseDto> success => success,
            BadRequest badRequest => badRequest,
            _ => throw new Exception("Impossible")
        };
    }

    public record CreateLicenseRequest(
        int LicenseExpirationInDays,
        long DiscordId,
        string? Username,
        string? Email,
        string? Password);
}