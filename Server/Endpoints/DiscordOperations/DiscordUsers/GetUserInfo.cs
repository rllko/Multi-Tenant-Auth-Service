using FastEndpoints;

namespace Authentication.Endpoints.DiscordOperations.DiscordUsers;

public class GetUserInfo : EndpointWithoutRequest
{
    public override void Configure()
    {
        AuthSchemes(DiscordBasicAuth.SchemeName);
        Get("/protected/{discordId}");
    }

    public override Task HandleAsync(CancellationToken ct)
    {
        return Task.CompletedTask;
    }
}