using Authentication.Misc;
using Authentication.Models.OAuth;
using FluentValidation;

namespace Authentication.Endpoints.Authentication.OAuth.TokenEndpoint;

public class TokenRequestValidator : AbstractValidator<TokenRequest>
{
    public TokenRequestValidator()
    {
        RuleFor(x => x.grant_type)
            .NotEmpty()
            .WithName("error")
            .WithMessage(ErrorTypeEnum.InvalidRequest.GetEnumDescription());
        RuleFor(x => x.code)
            .NotEmpty()
            .WithName("error")
            .WithMessage(ErrorTypeEnum.InvalidRequest.GetEnumDescription());
    }
}