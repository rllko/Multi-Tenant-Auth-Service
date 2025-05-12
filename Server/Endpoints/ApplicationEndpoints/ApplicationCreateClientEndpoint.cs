using Authentication.Attributes;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Clients;
using FastEndpoints;

namespace Authentication.Endpoints.ApplicationEndpoints;

public class ApplicationCreateClientEndpoint : Endpoint<CreateApplicationDto, IEnumerable<Client>>
{
    private readonly IClientService _clientService;

    public ApplicationCreateClientEndpoint(IClientService clientService)
    {
        _clientService = clientService;
    }

    public override void Configure()
    {
        Post("/teams/{teamId:guid}/apps/{appId:guid}/oauth/clients");
        PreProcessor<TenantProcessor<CreateApplicationDto>>();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("application.create")));
    }


    public override async Task HandleAsync(CreateApplicationDto req, CancellationToken ct)
    {
        var appId = Route<Guid>("appId");

        var licenses = await _clientService.GetClientsByApplicationAsync(appId);

        await SendOkAsync(licenses, ct);
    }
}