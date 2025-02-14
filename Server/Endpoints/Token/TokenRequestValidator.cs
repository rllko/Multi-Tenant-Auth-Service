using Authentication.Common;
using Authentication.OauthResponse;
using FluentValidation;

namespace Authentication.Endpoints.Token;

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