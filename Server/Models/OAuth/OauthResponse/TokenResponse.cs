using Authentication.Common;
using Authentication.Models;

namespace Authentication.OauthResponse;

public class TokenResponse
{
    /// <summary>
    ///     Oauth 2
    /// </summary>
    public string? AccessToken { get; set; } = null;

    ///// <summary>
    ///// OpenId Connect
    ///// </summary>
    public string? IdToken { get; set; } = null;

    /// <summary>
    ///     By default is Bearer
    /// </summary>

    public string TokenType { get; init; } = TokenTypeEnum.Bearer.GetEnumDescription();

    /// <summary>
    ///     Authorization Code. This is always returned when using the Hybrid Flow.
    /// </summary>
    public string? Code { get; set; }

    public string? RequestedScopes { get; set; }
}