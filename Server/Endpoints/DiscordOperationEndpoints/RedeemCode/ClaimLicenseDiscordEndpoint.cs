using Authentication.AuthenticationHandlers;
using Authentication.Services;
using Authentication.Services.Discords;
using FastEndpoints;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.DiscordOperationEndpoints.RedeemCode;

[Authorize(Policy = "Special")]
public class ClaimLicenseDiscordEndpoint(IDiscordService discordService)
    : Endpoint<RedeemLicenseRequestDto, Result<Ok, BadRequest>>
{
    public override void Configure()
    {
        AuthSchemes(DiscordBasicAuth.SchemeName);
        AllowFormData();
        Put("/protected/redeem-code");
    }

    public override async Task<Result<Ok, BadRequest>> HandleAsync(RedeemLicenseRequestDto codeRequest,
        CancellationToken ct)
    {
        var userFromCode = await discordService.ConfirmLicenseRegistrationAsync(codeRequest);

        var response = userFromCode.Match<IResult>(
            s => TypedResults.Ok(s),
            fail => TypedResults.BadRequest(fail.Errors));

        return response switch
        {
            Ok result => result,
            BadRequest badRequest => badRequest,
            _ => throw new NotImplementedException()
        };
    }
}