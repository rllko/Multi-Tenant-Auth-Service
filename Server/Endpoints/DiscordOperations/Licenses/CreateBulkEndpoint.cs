using Authentication.Contracts;
using Authentication.Models.Entities;
using Authentication.Services.Licenses.Builder;
using FastEndpoints;

namespace Authentication.Endpoints.DiscordOperations.Licenses;

public class CreateBulkEndpoint(ILicenseBuilder licenseService) : EndpointWithoutRequest
{
    public override void Configure()
    {
        Post("/protected/licenses/bulk");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var discordId = Query<ulong>("discordId", false);
        var amount = Query<int>("amount");

        var userList = await licenseService.CreateLicenseInBulk(amount);
        var enumerable = userList as License[] ?? userList.ToArray();

        await SendOkAsync(new DiscordResponse<IEnumerable<LicenseDto>>
        {
            Result = enumerable.Select(x => x.MapToDto())
        }, ct);
    }
}