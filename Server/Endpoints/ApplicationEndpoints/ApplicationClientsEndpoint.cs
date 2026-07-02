using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Clients;
using FastEndpoints;

namespace Authentication.Endpoints.ApplicationEndpoints;

public class ApplicationClientsEndpoint : EndpointWithoutRequest<IEnumerable<Client>>
{
    private readonly IClientService _clientService;

    public ApplicationClientsEndpoint(IClientService clientService)
    {
        _clientService = clientService;
    }

    public override void Configure()
    {
        Get("/teams/{teamId:guid}/apps/{appId:guid}/oauth/clients");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("application.retrieve")));
    
        Summary(s =>
        {
            s.Summary = "List OAuth clients of an application";
            s.Description = "Returns every OAuth client registered under the application. Bearer auth; requires the application.retrieve scope in the team.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
        });
    }


    public override async Task HandleAsync(CancellationToken ct)
    {
        var appId = Route<Guid>("appId");

        var licenses = await _clientService.GetClientsByApplicationAsync(appId);

        await SendOkAsync(licenses, ct);
    }
}