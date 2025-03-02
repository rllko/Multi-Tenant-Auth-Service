using Authentication.Services.UserSessions;
using FastEndpoints;
using FluentValidation.Results;

namespace Authentication.Endpoints.Sessions;

// to resume a session
public class SessionResumeEndpoint(IUserSessionService sessionService) : EndpointWithoutRequest

{
    public override void Configure()
    {
        AuthSchemes(SessionAuth.SchemeName);
        Get("/sessions/{id}");
        Throttle(
            hitLimit: 20,
            durationSeconds: 60
        );
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var sessionId = Route<Guid>("id");

        var tokenStr = User.Claims.FirstOrDefault(c => c.Type == "session-token")?.Value;

        if (Guid.TryParse(tokenStr!, out var tokenFromRequest) is false)
        {
            var error = new ValidationFailure("error", "Invalid session token");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        var session = await sessionService.GetSessionByIdAsync(sessionId);

        if (session is null || session.AuthorizationToken != tokenFromRequest)
        {
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        if (session.CreatedAt.Day != DateTime.Now.Day && session.RefreshedAt != null &&
            session.RefreshedAt.Value.Day != DateTime.Now.Day)
        {
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        if (session.License.ExpirationDate.ToUnixTimeSeconds() > DateTimeOffset.Now.ToUnixTimeSeconds())
        {
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        await SendOkAsync(ct);
    }
}