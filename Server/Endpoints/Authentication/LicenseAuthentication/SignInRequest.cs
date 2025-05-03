namespace Authentication.Endpoints.Authentication.LicenseAuthentication;

public record SignInRequest
{
    public required string Username { get; set; }
    public required string Password { get; set; }
}