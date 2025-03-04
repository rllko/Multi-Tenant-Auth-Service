using Authentication.Models.Entities;
using Authentication.RequestProcessors;
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
        Post("/protected/sessions/resume");
        Throttle(
            20,
            60
        );
        PreProcessor<SessionProcessor<EmptyRequest>>();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var session = HttpContext.Items["session"] as UserSession;

        if (session!.HwidId is null)
        {
            ValidationFailures.Add(new ValidationFailure("hwid_not_assigned", "Please assign an hwid to continue"));
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        // later add the whole logging here

        await SendOkAsync(ct);
    }
}