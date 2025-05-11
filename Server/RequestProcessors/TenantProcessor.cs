using Authentication.Attributes;
using Authentication.Services.Teams;
using Authentication.Services.Tenants;
using FastEndpoints;
using FluentValidation.Results;

namespace Authentication.RequestProcessors;

public class TenantProcessor<TRequest> : IPreProcessor<TRequest>
{
    public async Task PreProcessAsync(IPreProcessorContext<TRequest> ctx, CancellationToken ct)
    {
        var tenantService = ctx.HttpContext.RequestServices.GetRequiredService<ITenantService>();
        var teamService = ctx.HttpContext.RequestServices.GetRequiredService<ITeamService>();

        var token = ctx.HttpContext.User.Claims.FirstOrDefault(x => x.Type == "access_token");

        if (token is null)
        {
            await ctx.HttpContext.Response.SendForbiddenAsync(ct);

            return;
        }

        var session = await tenantService.GetSessionAsync(token.Value);

        if (session is null)
        {
            ctx.ValidationFailures.Add(
                new ValidationFailure("invalid_session", "Session could not be found"));

            await ctx.HttpContext.Response.SendErrorsAsync(ctx.ValidationFailures, cancellation: ct);

            return;
        }

        if (ctx.HttpContext.GetRouteData().Values.TryGetValue("teamId", out var teamIdObj) &&
            teamIdObj is string teamId)
        {
            Console.WriteLine($"Team ID from route: {teamId}");
            var result = await teamService.GetTeamsForUserAsync(session.TenantId);

            await result.Match(
                async teams =>
                {
                    var isMember = teams.Any(t => t.Id.ToString() == teamId);

                    if (isMember is false) await ctx.HttpContext.Response.SendForbiddenAsync(ct);
                },
                () => throw new UnauthorizedAccessException("Could not load teams.")
            );

            var endpoint = ctx.HttpContext.GetEndpoint();
            var permissionAttr = endpoint?.Metadata.GetMetadata<RequiresPermissionAttribute>();

            if (permissionAttr is not null &&
                await teamService.CheckUserScopesAsync(session.TenantId, teamId,
                    permissionAttr.Permission) is false)
            {
                await ctx.HttpContext.Response.SendForbiddenAsync(ct);

                return;
            }
        }

        ctx.HttpContext.Items["Session"] = session;
    }
}