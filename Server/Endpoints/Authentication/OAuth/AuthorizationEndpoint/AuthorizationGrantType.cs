using System.ComponentModel;

namespace Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;

public enum AuthorizationGrantType
{
    [Description("Bearer")] Bearer,
}