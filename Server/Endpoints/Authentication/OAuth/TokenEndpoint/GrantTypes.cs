using Authentication.Common;
using Authentication.Models;

namespace Authentication.Endpoints.Token;

//https://www.rfc-editor.org/rfc/rfc6749#page-23
public class GrantTypes
{
    public static IList<string> Code =>
        new[] { AuthorizationGrantTypesEnum.Code.GetEnumDescription() };

    public static IList<string> Implicit =>
        new[] { AuthorizationGrantTypesEnum.Implicit.GetEnumDescription() };

    public static IList<string> ClientCredentials =>
        new[] { AuthorizationGrantTypesEnum.ClientCredentials.GetEnumDescription() };

    public static IList<string> ResourceOwnerPassword =>
        new[] { AuthorizationGrantTypesEnum.ResourceOwnerPassword.GetEnumDescription() };
}