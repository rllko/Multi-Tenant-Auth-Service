using FastEndpoints;
using FluentValidation;

namespace Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;

public class AuthorizeRequestValidation : Validator<AuthorizeRequest>
{
    public AuthorizeRequestValidation()
    {
        RuleFor(x => x.ClientId)
            .NotEmpty();

        RuleFor(x => x.ResponseType)
            .NotEmpty()
            .Matches("code");

        RuleFor(x => x.State)
            .NotEmpty()
            .Matches("123456789");
    }
}