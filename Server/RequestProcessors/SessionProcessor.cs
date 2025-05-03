using System.Security.Claims;
using Authentication.Services.Licenses.Sessions;
using FastEndpoints;
using FluentValidation.Results;

namespace Authentication.RequestProcessors;

public class SessionProcessor<TRequest> : IPreProcessor<TRequest>
{
    public async Task PreProcessAsync(IPreProcessorContext<TRequest> ctx, CancellationToken ct)
    {
        var sessionService = ctx.HttpContext.RequestServices.GetRequiredService<ILicenseSessionService>();

        var token = ctx.HttpContext.User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Authentication);

        if (token is null || Guid.TryParse(token.Value, out var tokenGuid) is false)
        {
            await ctx.HttpContext.Response.SendForbiddenAsync(ct);
            return;
        }

        var session = await sessionService.GetSessionByTokenAsync(tokenGuid);

#warning please make this more complete, add checks
        // check if session is active
        if (session is null)
        {
            ctx.ValidationFailures.Add(
                new ValidationFailure("invalid_session", "Session could not be found"));
            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);
            return;
        }

        if (session.License.ExpiresAt < DateTimeOffset.Now.ToUnixTimeSeconds())
        {
            ctx.ValidationFailures.Add(
                new ValidationFailure("expired_license", "Your license is expired"));
            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);
            return;
        }

        if (session.Active is false)
        {
            ctx.ValidationFailures.Add(new ValidationFailure(
                "session_inactive",
                "This session is not active, try logging in again"));
            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);
            return;
        }

        if (session.License.Paused)
        {
            ctx.ValidationFailures.Add(new ValidationFailure("paused_paused",
                "This license is paused, contact support for more info."));
            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);
            return;
        }

        // if it was created more than one day ago, refresh
        if (session.RefreshedAt != null && DateTimeOffset.Now.ToUnixTimeSeconds() > DateTimeOffset
                .FromUnixTimeSeconds((long)session.RefreshedAt)
                .AddDays(1).ToUnixTimeSeconds())
        {
            ctx.ValidationFailures.Add(new ValidationFailure(
                "not_refreshed",
                "Session could not be created"));
            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);
        }

        ctx.HttpContext.Items["Session"] = session;
    }
}