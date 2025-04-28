using System.ComponentModel;

namespace Authentication.Endpoints.Authentication.OAuth.TokenEndpoint;

public enum TokenTypeEnum : byte
{
    [Description("Bearer")] Bearer
}