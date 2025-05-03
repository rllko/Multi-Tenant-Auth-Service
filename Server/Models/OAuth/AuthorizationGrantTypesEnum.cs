using System.ComponentModel;

namespace Authentication.Models.OAuth;

internal enum AuthorizationGrantTypesEnum : byte
{
    [Description("code")] Code,

    [Description("Implicit")] Implicit,

    [Description("ClientCredentials")] ClientCredentials,

    [Description("ResourceOwnerPassword")] ResourceOwnerPassword
}