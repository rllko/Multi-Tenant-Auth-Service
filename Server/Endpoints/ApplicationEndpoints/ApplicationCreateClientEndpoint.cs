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
    
        Summary(s =>
        {
            s.Summary = "Create an OAuth client for an application";
            s.Description = "Registers a new OAuth client under the application and returns the application's clients. Bearer auth; requires the application.create scope.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
            s.Response(200, "Array of the application's OAuth clients after creation");
            s.Response(403, "Not a team member or missing scope");
        });
    }


    public override async Task HandleAsync(CreateApplicationDto req, CancellationToken ct)
    {
        var appId = Route<Guid>("appId");

        var licenses = await _clientService.GetClientsByApplicationAsync(appId);

        await SendOkAsync(licenses, ct);
    }
}