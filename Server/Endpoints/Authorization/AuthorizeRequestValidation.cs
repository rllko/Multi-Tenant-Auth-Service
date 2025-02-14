using FastEndpoints;
using FluentValidation;

namespace Authentication.Endpoints.Authorization;

public class AuthorizeRequestValidation : Validator<AuthorizeRequest>
{
    public AuthorizeRequestValidation()
    {
        RuleFor(x => x.ClientId)
            .NotEmpty();

        RuleFor(x => x.ResponseType)
            .NotEmpty()
            .Matches("code");

        RuleFor(x => x.CodeChallenge)
            .NotEmpty()
            .WithName("error");

        RuleFor(x => x.State)
            .NotEmpty()
            .Matches("123456789");

        RuleFor(x => x.CodeChallenge)
            .NotEmpty();

        RuleFor(x => x.CodeChallengeMethod)
            .NotEmpty();
    }
}