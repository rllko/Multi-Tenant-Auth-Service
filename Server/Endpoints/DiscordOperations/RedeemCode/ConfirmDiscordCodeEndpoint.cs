using Authentication.Services.Discords;
using FastEndpoints;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.DiscordOperations.RedeemCode;

[Authorize(Policy = "Special")]
public class ConfirmDiscordCodeEndpoint(IDiscordService discordService)
    : Endpoint<RedeemDiscordCodeDto, Result<Ok, BadRequest>>
{
    public override void Configure()
    {
        AllowFormData();
        Put("/protected/redeem-code");
    }

    public override async Task<Result<Ok, BadRequest>> HandleAsync(RedeemDiscordCodeDto codeRequest,
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