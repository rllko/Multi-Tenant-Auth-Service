namespace Authentication.Endpoints.DiscordOperations.RedeemCode;

public record RedeemLicenseRequestDto
{
    public required string License { get; set; }
    public required long DiscordId { get; set; }
    public required string Email { get; set; }
    public required string Username { get; set; }
}