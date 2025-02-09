using Authentication.OauthRequest;
using FluentValidation;

namespace Authentication.Validators.Authentication;

public class TokenRequestValidator : AbstractValidator<TokenRequest>
{
    public TokenRequestValidator()
    {
        RuleFor(x => x.ClientId).NotEmpty();
        RuleFor(x => x.ClientSecret).NotEmpty();
        RuleFor(x => x.Code).NotEmpty();
        RuleFor(x => x.GrantType).NotEmpty();
    }
}