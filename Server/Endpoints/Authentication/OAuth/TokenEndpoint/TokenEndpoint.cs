using Authentication.Services.Authentication.AuthorizeResult;
using FastEndpoints;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.Authentication.OAuth.TokenEndpoint;

public class TokenEndpoint(IAuthorizeResultService authorizeService)
    : Endpoint<TokenRequest, Results<Ok<TokenResponse>, BadRequest>>
{
    public override void Configure()
    {
        Post("auth/token");
        AllowAnonymous();
        EnableAntiforgery();
    }

    public override async Task<Results<Ok<TokenResponse>, BadRequest>> ExecuteAsync(TokenRequest req,
        CancellationToken ct)
    {
        var result = await authorizeService.GenerateToken(req);

        var response = result.Match<IResult>(
            token => TypedResults.Ok(token),
            failed => TypedResults.BadRequest());

        return response switch
        {
            Ok<TokenResponse> success => success,
            BadRequest badRequest => badRequest,
            _ => throw new Exception("Impossible")
        };
    }
}