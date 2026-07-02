using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Tenants;
using FastEndpoints;

namespace Authentication.Endpoints.TenantEndpoints;

public class TenantProfileEndpoint(ITenantService tenantService) : EndpointWithoutRequest
{
    private readonly ITenantService _tenantService = tenantService;

    public override void Configure()
    {
        Post("/me");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
    
        Summary(s =>
        {
            s.Summary = "Get my profile";
            s.Description = "Returns the authenticated tenant's profile (id, name, email). Bearer auth.";
            s.Response<TenantDto>(200, "{ id, discordId, email, role, name }");
            s.Response<ErrorResponse>(400, "No valid session");
        });
    }


    public override async Task HandleAsync(CancellationToken ct)
    {
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        if (session is null)
        {
            AddError("User without a valid session");
            await SendErrorsAsync(cancellation: ct);

            return;
        }

        var profile = await tenantService.GetTenantByIdAsync(session.TenantId);

        await profile.Match(
            async invite => await SendOkAsync(invite, ct),
            async () =>
            {
                AddError("User doesnt exist.");
                await SendErrorsAsync(cancellation: ct);
            });
    }
}