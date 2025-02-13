using Authentication.Common;
using Authentication.OauthResponse;
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
            .WithMessage(ErrorTypeEnum.InvalidRequest.GetEnumDescription());

        RuleFor(x => x.ResponseType)
            .NotEmpty()
            .WithName("error")
            .WithMessage(ErrorTypeEnum.InvalidRequest.GetEnumDescription())
            .Matches("/code/")
            .WithMessage("invalid response type");

        RuleFor(x => x.CodeChallenge)
            .NotEmpty()
            .WithName("error")
            .WithMessage(ErrorTypeEnum.InvalidRequest.GetEnumDescription());

        RuleFor(x => x.State)
            .NotEmpty()
            .WithName("error")
            .WithMessage("some fields are required")
            .Matches("123456789")
            .WithMessage("invalid client");

        RuleFor(x => x.CodeChallenge).NotEmpty()
            .WithName("error")
            .WithMessage(ErrorTypeEnum.InvalidRequest.GetEnumDescription());

        RuleFor(x => x.CodeChallengeMethod)
            .NotEmpty()
            .WithName("error")
            .WithMessage(ErrorTypeEnum.InvalidRequest.GetEnumDescription());
    }
}