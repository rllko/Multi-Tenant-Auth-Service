using Authentication.Contracts;
using Authentication.Models.Entities;
using Authentication.Services.Discords;
using Authentication.Services.Licenses.Builder;
using FastEndpoints;
using Microsoft.AspNetCore.Http.HttpResults;
using Exception = System.Exception;

namespace Authentication.Endpoints.DiscordOperations.Licenses;

internal class CreateEndpoint(ILicenseBuilder licenseBuilder, IDiscordService discordService)
    : EndpointWithoutRequest<Results<Ok<LicenseDto>, BadRequest>>
{
    public override void Configure()
    {
        AuthSchemes(DiscordBasicAuth.SchemeName);
        AllowAnonymous();
        Post("/protected/licenses/{discordId}");
    }

    public override async Task<Results<Ok<LicenseDto>, BadRequest>> ExecuteAsync(
        CancellationToken ct)
    {
        var discordId = Route<long>("discordId");

        var existingDiscord = await discordService.GetByIdAsync(discordId) ??
                              await discordService.CreateUserAsync(discordId);

        var key = await licenseBuilder.CreateLicenseAsync(
            existingDiscord?.DiscordId ?? null);

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
}