using Authentication.Validators.Authentication;

namespace Authentication.OauthRequest;

public record TokenRequest(string ClientId, string ClientSecret,string Code, string GrantType);