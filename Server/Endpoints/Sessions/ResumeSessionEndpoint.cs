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

        //    if (request.Hwid is null)
        //  {
        //    var error = new ValidationFailure("error", "hwid is required.");
        //   return new ValidationFailed(error);
        // }

        /*// if limit is reached, check hwid
        var hwids = await hwidService.GetHwidByDtoAsync(request.Hwid);

        Hwid? hwid = null;
        // Filter out those HWID DTOs that match the CPU and BIOS, but only one other property is different.
        foreach (var hwidDto in hwids)
            // Check if CPU and BIOS are the same
            if (hwidDto.Cpu == request.Hwid.cpu && hwidDto.Bios == request.Hwid.bios)
            {
                // Count how many properties differ
                var differentPropertiesCount = 0;

                if (hwidDto.Ram != request.Hwid.ram) differentPropertiesCount++;
                if (hwidDto.Disk != request.Hwid.disk) differentPropertiesCount++;
                if (hwidDto.Display != request.Hwid.display) differentPropertiesCount++;

                // If only one property differs, it's a match
                if (differentPropertiesCount == 1) hwid = hwidDto;
            }

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
        // resume assigns the hwid / continues the thing
        // refresh refreshes the token, give jwt and it retrieves
        // delete will turn the is_active flag
        // create session

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