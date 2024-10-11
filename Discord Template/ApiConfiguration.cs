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

    public string CreateLicenseEndpoint => BaseUrl + "skibidiAuth/create";

    public string CreateBulkLicenseEndpoint => BaseUrl + "skibidiAuth/create-bulk";

    public string ResetHwidEndpoint => BaseUrl + "skibidiAuth/reset-hwid";

    public string GetLicensesEndpoint => BaseUrl + "skibidiAuth/get-licenses";

    public string GetConfirmEndpoint => BaseUrl + "skibidiAuth/confirm-discord-license";

    public string OffsetsEndpoint => BaseUrl + "skibidiAuth/software-offsets";

    public string PublicOffsetsEndpoint => BaseUrl + "2525546191";
}

