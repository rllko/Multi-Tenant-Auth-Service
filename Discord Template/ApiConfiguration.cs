namespace DiscordTemplate;

public class ApiConfiguration
{
    public string? ClientId { get; init; }

    public string? ClientSecret { get; init; }

    public required string BaseUrl { get; set; }

    public string? Response_type { get; set; }

    public string? State { get; set; }

    public string? Scope { get; set; }

    public string? Code_challenge_method { get; set; }

    public string AuthorizationEndpoint => BaseUrl + "skibidiAuth/authorize";

    public string TokenEndpoint => BaseUrl + "skibidiAuth/token";

    public string BaseDirectory => BaseUrl + "skibidiAuth/";
    
    public string CreateLicenseEndpoint => BaseDirectory + "create";

    public string CreateBulkLicenseEndpoint => BaseDirectory + "create-bulk";

    public string ResetHwidEndpoint => BaseDirectory + "reset-hwid";

    public string GetLicensesEndpoint => BaseDirectory + "get-licenses";

    public string GetConfirmEndpoint => BaseDirectory + "confirm-discord-license";

    public string OffsetsEndpoint => BaseDirectory + "cdn";
}

