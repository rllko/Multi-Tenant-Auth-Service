using Authentication.Endpoints.Sessions;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.UserSessions;
using FastEndpoints;

namespace Authentication.Endpoints.SessionToken;

public class LogoutEndpoint(ILicenseSessionService sessionService) : EndpointWithoutRequest
{
    public override void Configure()
    {
        AuthSchemes(LicenseSessionAuth.SchemeName);
        Delete("/sessions");
        Throttle(
            10,
            60
        );
        PreProcessor<SessionProcessor<EmptyRequest>>();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var session = HttpContext.Items["Session"] as LicenseSession;

        var result = await sessionService.DeleteSessionTokenAsync(session!.SessionId);

        if (result)
        {
            await SendOkAsync(ct);
            return;
        }

        await SendErrorsAsync(400, ct);
    }
}