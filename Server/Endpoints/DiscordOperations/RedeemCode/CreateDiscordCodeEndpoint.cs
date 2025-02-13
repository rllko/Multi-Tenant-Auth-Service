using Authentication.Common;
using Authentication.OauthResponse;
using Authentication.Services.Authentication.CodeStorage;
using FastEndpoints;
using Microsoft.AspNetCore.Mvc;

namespace Authentication.Endpoints.DiscordOperations.RedeemCode;

public class CreateDiscordCodeEndpoint : EndpointWithoutRequest
{
    public override void Configure()
    {
        base.Configure();
    }

    public override Task HandleAsync(CancellationToken ct)
    {
        return base.HandleAsync(ct);
    }

    public static async Task<IResult> Handle(HttpContext httpContext,
        [FromServices] ILicenseManagerService userManagerService,
        ICodeStorageService codeStorage)
    {
        var Request = httpContext.Request;

        Request.Form.TryGetValue("3917505287", out var License);

        if (string.IsNullOrEmpty(License) || License.ToString().Length < 36)
        {
            await httpContext.Response.WriteAsJsonAsync(new
                { Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription() });
            return Results.NotFound();
        }

        var user = await userManagerService.GetLicenseByLicenseAsync(License!);

        if (user == null)
        {
            await httpContext.Response.WriteAsJsonAsync(new
                { Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription() });
            return Results.BadRequest();
        }

        if (user.DiscordUser != null) return Results.Json(new { Error = "Key is already confirmed." });

        var discordCode = codeStorage.CreateDiscordCodeAsync(License!);

        return Results.Json(new { Error = "none", Result = 0 });
    }
}