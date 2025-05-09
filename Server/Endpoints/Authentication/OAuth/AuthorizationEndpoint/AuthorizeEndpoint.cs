using Authentication.Services.Authentication.AuthorizeResult;
using FastEndpoints;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;

public class AuthorizeEndpoint(IAuthorizeResultService authorizeService)
    : Endpoint<AuthorizeRequest, Results<Ok<AuthorizeResponse>, BadRequest>>
{
    public override void Configure()
    {
        Get("/auth/authorize");
        DontThrowIfValidationFails();
        AllowAnonymous();
        EnableAntiforgery();
    }

    public override async Task<Results<Ok<AuthorizeResponse>, BadRequest>> ExecuteAsync(AuthorizeRequest req,
        CancellationToken ct)
    {
        var result = await authorizeService.AuthorizeRequestAsync(HttpContext, req);
        var response = result.Match<IResult>(
            authResponse => TypedResults.Ok(authResponse),
            failed => TypedResults.BadRequest());

        return response switch
        {
            Ok<AuthorizeResponse> success => success,
            BadRequest badRequest => badRequest,
            _ => throw new Exception("Impossible")
        };
    }
}