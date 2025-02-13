using Authentication.Common;
using Authentication.Controllers.Token;
using Authentication.OauthResponse;
using FluentValidation;

namespace Authentication.Validators.Authentication;

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