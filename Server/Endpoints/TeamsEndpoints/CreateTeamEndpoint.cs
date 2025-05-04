using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services.Teams;
using FastEndpoints;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.TeamsEndpoints;

public class CreateTeamEndpoint(ITeamService teamsService) : EndpointWithoutRequest<IResult>
{
    public override void Configure()
    {
        Claims("access_token");
        Post("/teams");
        Throttle(
            20,
            60
        );
        PreProcessor<TenantProcessor<EmptyRequest>>();
    }

    public override async Task<IResult> ExecuteAsync(CancellationToken ct)
    {
        var session = HttpContext.Items["Session"] as TenantSessionInfo;

        var req = await HttpContext.Request.ReadFromJsonAsync<TeamCreateDto>(ct);

        if (req is null) ThrowError("invalid payload");

        var result = await teamsService.CreateTeamAsync(req, session!.TenantId);
        var response = result.Match<IResult>(authResponse => TypedResults.Ok<TeamDto>(authResponse),
            failed => TypedResults.BadRequest(failed));

        return response switch
        {
            Ok<TeamDto> success => success,
            BadRequest badRequest => badRequest,
            _ => throw new Exception("Impossible")
        };
    }
}