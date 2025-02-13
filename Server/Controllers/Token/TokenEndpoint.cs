using Authentication.OauthResponse;
using Authentication.Services.Authentication.AuthorizeResult;
using FastEndpoints;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Controllers.Token;

public class TokenEndpoint(IAuthorizeResultService authorizeService)
    : Endpoint<TokenRequest, Results<Ok<TokenResponse>, BadRequest>>
{
    public override void Configure()
    {
        Post("auth/token");
        AllowAnonymous();
    }

    public override async Task<Results<Ok<TokenResponse>, BadRequest>> HandleAsync(TokenRequest req,
        CancellationToken ct)
    {
        var result = await authorizeService.GenerateToken(req);

        var response = result.Match<IResult>(
            token => TypedResults.Ok(token),
            failed => TypedResults.BadRequest(failed.Errors));

        return response switch
        {
            Ok<TokenResponse> success => success,
            BadRequest badRequest => badRequest,
            _ => throw new Exception("Impossible")
        };
    }
}