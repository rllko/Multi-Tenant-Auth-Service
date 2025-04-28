using System.Security.Claims;
using Authentication.Services.Tenants;
using Authentication.Services.UserSessions;
using FastEndpoints;
using FluentValidation.Results;

namespace Authentication.RequestProcessors;

public class TenantProcessor<TRequest> : IPreProcessor<TRequest>
{
    public async Task PreProcessAsync(IPreProcessorContext<TRequest> ctx, CancellationToken ct)
    {
        var sessionService = ctx.HttpContext.RequestServices.GetRequiredService<ITenantService>();

        var token = ctx.HttpContext.User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Authentication);

        if (token is null)
        {
            await ctx.HttpContext.Response.SendForbiddenAsync(ct);
            return;
        }

        var session = await sessionService.GetSessionAsync(token.Value);

#warning please make this more complete, add checks
        // check if session is active
        if (session is null)
        {
            ctx.ValidationFailures.Add(
                new ValidationFailure("invalid_session", "Session could not be found"));
            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);
            return;
        }

        if (session.Expires < DateTimeOffset.Now)
        {
            ctx.ValidationFailures.Add(
                new ValidationFailure("expired_session", "Your session is expired"));
            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);
            return;
        }

        ctx.HttpContext.Items["Session"] = session;
    }
}