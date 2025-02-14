using FastEndpoints;

namespace Authentication.Endpoints.DiscordOperations.RedeemCode;

public record RedeemDiscordCodeDto
{
    [FromBody] public string code { get; set; }
    [FromBody] public ulong discordId { get; set; }
}