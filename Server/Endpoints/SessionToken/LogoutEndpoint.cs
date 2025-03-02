using Authentication.Endpoints.Sessions;
using Authentication.Services.UserSessions;
using FastEndpoints;

namespace Authentication.Endpoints.SessionToken;

public class LogoutEndpoint(IUserSessionService sessionService) : EndpointWithoutRequest
{
    public override void Configure()
    {
        AuthSchemes(SessionAuth.SchemeName);
        Delete("/sessions/{id}");
        Throttle(
            10,
            60
        );
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var tokenStr = User.Claims.FirstOrDefault(c => c.Type == "session-token")?.Value;

        if (string.IsNullOrWhiteSpace(tokenStr) || Guid.TryParse(tokenStr!, out var tokenGuid) is false)
        {
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        var result = await sessionService.LogoutLicenseSessionAsync(tokenGuid);

        if (result)
        {
            await SendOkAsync(ct);
            return;
        }

        await SendErrorsAsync(400, ct);
    }
}