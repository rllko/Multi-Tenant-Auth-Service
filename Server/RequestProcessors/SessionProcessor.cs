using System.Security.Claims;
using Authentication.Services.Licenses.Sessions;
using FastEndpoints;
using FluentValidation.Results;

namespace Authentication.RequestProcessors;

public class SessionProcessor<TRequest> : IPreProcessor<TRequest>
{
    private const int SessionRefreshLifetimeInDays = 1;

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

        if (session is null)
        {
            ctx.ValidationFailures.Add(
                new ValidationFailure("invalid_session", "Session could not be found"));
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

        if (session.License is null)
        {
            ctx.ValidationFailures.Add(
                new ValidationFailure("invalid_license", "License could not be found"));
            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);
            return;
        }

        if (session.License.Paused)
        {
            ctx.ValidationFailures.Add(new ValidationFailure("license_paused",
                "This license is paused, contact support for more info."));
            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);
            return;
        }

        if (session.License.Banned)
        {
            ctx.ValidationFailures.Add(new ValidationFailure("license_banned",
                "This license is banned, contact support for more info."));
            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);
            return;
        }

        if (session.License.Revoked)
        {
            ctx.ValidationFailures.Add(new ValidationFailure("license_revoked",
                "This license has been revoked, contact support for more info."));
            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);
            return;
        }

        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        if (session.License.ExpiresAt <= now)
        {
            ctx.ValidationFailures.Add(
                new ValidationFailure("expired_license", "Your license is expired"));
            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);
            return;
        }

        if (session.RefreshedAt != null && now > DateTimeOffset
                .FromUnixTimeSeconds((long)session.RefreshedAt)
                .AddDays(SessionRefreshLifetimeInDays).ToUnixTimeSeconds())
        {
            ctx.ValidationFailures.Add(new ValidationFailure(
                "not_refreshed",
                "Session could not be created"));
            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);
            return;
        }

        ctx.HttpContext.Items["session"] = session;
    }
}
