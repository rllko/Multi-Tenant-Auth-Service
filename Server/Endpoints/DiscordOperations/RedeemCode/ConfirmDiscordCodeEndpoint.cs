using Authentication.Services.Discords;
using FastEndpoints;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.DiscordOperations.RedeemCode;

public record DiscordCodeRequest
{
    [FromBody] public string Code { get; set; }

    [FromBody] public ulong DiscordId { get; set; }
}

[Authorize(Policy = "Special")]
public class ConfirmDiscordCodeEndpoint(IDiscordService discordService)
    : Endpoint<RedeemDiscordCodeDto, Result<Ok, BadRequest>>
{
    public override void Configure()
    {
        AllowFormData();
        Post("/protected/redeem-code");
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