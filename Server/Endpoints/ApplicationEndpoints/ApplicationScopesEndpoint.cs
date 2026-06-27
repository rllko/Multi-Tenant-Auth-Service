using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Clients;
using FastEndpoints;

namespace Authentication.Endpoints.ApplicationEndpoints;

public class ApplicationScopesEndpoint : EndpointWithoutRequest<IEnumerable<ScopeDto>>
{
    private readonly IClientService _clientService;

    public ApplicationScopesEndpoint(IClientService clientService)
    {
        _clientService = clientService;
    }

    public override void Configure()
    {
        Get("/teams/{teamId:guid}/apps/{appId:guid}/permissions");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("application.retrieve")));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var appId = Route<Guid>("appId");
        var teamId = Route<Guid>("teamId");

        var licenses = await _clientService.GetClientScopesForTeamAsync(teamId, appId);

        await SendOkAsync(licenses, ct);
    }
}