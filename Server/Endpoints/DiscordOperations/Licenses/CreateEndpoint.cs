using Authentication.Contracts;
using Authentication.Models.Entities;
using Authentication.Services.Discords;
using Authentication.Services.Licenses.Builder;
using FastEndpoints;

namespace Authentication.Endpoints.DiscordOperations.Licenses;

internal class CreateEndpoint(ILicenseBuilder licenseBuilder, IDiscordService discordService) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Post("/protected/licenses/{discordId}");
#warning add authentication
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var discordId = Query<ulong>("discordId");

#warning add Result to this bih
        var existingDiscord = await discordService.GetByIdAsync(discordId) ??
                              await discordService.CreateUserAsync(discordId);

        var key = await licenseBuilder.CreateLicenseAsync(
            existingDiscord?.DiscordId ?? null);

        await SendOkAsync(
            new DiscordResponse<LicenseDto>
            {
                Result = key.MapToDto()
            }, ct);
    }
}