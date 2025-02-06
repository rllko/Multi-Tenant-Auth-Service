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

    public string TokenType { get; set; } = TokenTypeEnum.Bearer.GetEnumDescription();

    /// <summary>
    ///     Authorization Code. This is always returned when using the Hybrid Flow.
    /// </summary>
    public string? Code { get; set; }


    public string? RequestedScopes { get; set; }

    /// <summary>
    ///     For Error Details if any
    /// </summary>
    public string Error { get; set; } = string.Empty;

    public string? ErrorUri { get; set; }
    public string? ErrorDescription { get; set; }
    public bool HasError => !string.IsNullOrEmpty(Error);
}