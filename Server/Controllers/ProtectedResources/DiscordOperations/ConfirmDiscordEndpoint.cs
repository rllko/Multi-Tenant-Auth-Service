using Authentication.Services.Authentication.CodeStorage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Authentication.Endpoints.ProtectedResources.DiscordOperations;

[Authorize(Policy = "Special")]
public class ConfirmDiscordEndpoint
{
    [HttpPost]
    public static async Task<IResult> Handle(HttpContext httpContext,
        ILicenseManagerService userManagerService,
        ICodeStorageService codeStorage)
    {
  
    }
}