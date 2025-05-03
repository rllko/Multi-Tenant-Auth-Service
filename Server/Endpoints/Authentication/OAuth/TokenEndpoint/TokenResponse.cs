using Authentication.Misc;

namespace Authentication.Endpoints.Authentication.OAuth.TokenEndpoint;

public class TokenResponse
{
    /// <summary>
    ///     Oauth 2
    /// </summary>
    public required string AccessToken { get; set; }

    ///// <summary>
    ///// OpenId Connect
    ///// </summary>
    public DateTime ExpiresIn { get; set; } = DateTime.Now.AddMinutes(30);

    /// <summary>
    ///     By default is Bearer
    /// </summary>

    public string TokenType { get; init; } = TokenTypeEnum.Bearer.GetEnumDescription();
}