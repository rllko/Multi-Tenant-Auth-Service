using Authentication.Models.Entities;
using Authentication.Services.Licenses.Builder;
using FastEndpoints;

namespace Authentication.Endpoints.DiscordOperationEndpoints.Licenses;

public class CreateBulkEndpoint(ILicenseBuilder licenseService) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Post("/protected/licenses/bulk");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var discordId = Query<long>("discordId", false);
        var amount = Query<int>("amount");
        var licenseExpirationInDays = Query<int>("licenseExpirationInDays");

        var userList = await licenseService.CreateLicenseInBulk(
            amount,
            licenseExpirationInDays);

        await SendOkAsync(new DiscordResponse<IEnumerable<LicenseDto>>
        {
            Result = userList.Select(x => x)
        }, ct);
    }
}