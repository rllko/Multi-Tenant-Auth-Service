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
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var tokenStr = User.Claims.FirstOrDefault(c => c.Type == "session-token")?.Value;

        if (Guid.TryParse(tokenStr!, out var tokenFromRequest) is false)
        {
            var error = new ValidationFailure("error", "Invalid session token");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        /*// if limit is reached, check hwid

        // if hwid correct, give him current session
        if (hwid is not null)
        {
            var session = await GetSessionByHwidAsync(hwid.Id);

            if (session?.AuthorizationToken is null || session.RefreshedAt?.Day == DateTimeOffset.Now.Day)
            {
                var error = new ValidationFailure("error", "A session already exists");
                return new ValidationFailed(error);
            }

            return await RefreshLicenseSession((Guid)session.AuthorizationToken);
        }*/

        // if no, create hwid
        // var newHwid = await hwidService.CreateHwidAsync(request.Hwid, transaction);
        //
        // if (newHwid is null)
        // {
        //     transaction.Rollback();
        //     var error = new ValidationFailure("error", "something wrong happened!");
        //     return new ValidationFailed(error);
        // }

        // var session = await sessionService.GetSessionByIdAsync(sessionId);

        // if (session is null || session.AuthorizationToken != tokenFromRequest)
        // {
        //     await SendErrorsAsync(cancellation: ct);
        //     return;
        // }

        /*
        var createdAt = DateTimeOffset.FromUnixTimeSeconds(session.CreatedAt);
        var refreshedAt = DateTimeOffset.FromUnixTimeSeconds((long)session.RefreshedAt);

        // if ( != DateTime.Now.Day && session.RefreshedAt != null &&
        //     session.RefreshedAt is not null &&
        //     DateTimeOffset.FromUnixTimeSeconds((long)session.RefreshedAt).Day != DateTime.Now.Day)
        // {
        //     await SendErrorsAsync(cancellation: ct);
        //     return;
        // }

        if (session.License.ExpirationDate > DateTimeOffset.Now.ToUnixTimeSeconds())
        {
            await SendErrorsAsync(cancellation: ct);
            return;
        }
        */

        await SendOkAsync(ct);
    }
}