using System.ComponentModel;

namespace Authentication.Endpoints.Token;

public enum TokenTypeEnum : byte
{
    [Description("Bearer")] Bearer
}