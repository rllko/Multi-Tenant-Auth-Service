namespace Authentication.Endpoints.DiscordOperations.RedeemCode;

public record RedeemDiscordCodeDto
{
    public string License { get; set; }
    public long DiscordId { get; set; }
    public string Email { get; set; }
    public string Username { get; set; }
}