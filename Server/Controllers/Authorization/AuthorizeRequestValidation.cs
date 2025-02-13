using FastEndpoints;
using FluentValidation;

namespace Authentication.Controllers.Authorization;

public class AuthorizeRequestValidation : Validator<AuthorizeRequest>
{
    public AuthorizeRequestValidation()
    {
        RuleFor(x => x.ClientId)
            .NotEmpty()
            .WithName("error")
            .WithMessage("some fields are required");

        RuleFor(x => x.ResponseType)
            .NotEmpty()
            .WithName("error")
            .WithMessage("some fields are required")
            .Matches("/code/")
            .WithMessage("invalid response type");

        RuleFor(x => x.CodeChallenge)
            .NotEmpty()
            .WithName("error")
            .WithMessage("some fields are required");

        RuleFor(x => x.State)
            .NotEmpty()
            .WithName("error")
            .WithMessage("some fields are required")
            .Matches("123456789")
            .WithMessage("invalid client");

        RuleFor(x => x.CodeChallenge).NotEmpty()
            .WithName("error")
            .WithMessage("some fields are required")
            .WithMessage("invalid code challenge");

        RuleFor(x => x.CodeChallengeMethod)
            .NotEmpty()
            .WithName("error")
            .WithMessage("some fields are required")
            .WithMessage("invalid code challenge_method");
    }
}