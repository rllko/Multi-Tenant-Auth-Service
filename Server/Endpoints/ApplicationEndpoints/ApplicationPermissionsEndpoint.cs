using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Clients;
using FastEndpoints;

namespace Authentication.Endpoints.ApplicationEndpoints;

public class ApplicationPermissionsEndpoint : EndpointWithoutRequest<IEnumerable<Client>>
{
    private readonly IClientService _clientService;

    public ApplicationPermissionsEndpoint(IClientService clientService)
    {
        _clientService = clientService;
    }

    public override void Configure()
    {
        Get("/teams/{teamId:guid}/apps/{appId:guid}/oauth/clients");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        Options(x => x.WithMetadata(new RequiresPermissionAttribute("application.retrieve")));
    }


    public override async Task HandleAsync(CancellationToken ct)
    {
        var appId = Route<Guid>("appId");

        var licenses = await _clientService.GetClientPermissionsForTeamAsync(appId);

        await SendOkAsync(licenses, ct);
    }
}