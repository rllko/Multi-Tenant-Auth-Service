using FastEndpoints;
using FluentValidation;

namespace Authentication.Endpoints.DiscordOperationEndpoints.Accounts;

public class AcivateLicenseRequestValidator : Validator<ActivateLicenseRequest>
{
    public AcivateLicenseRequestValidator()
    {
        RuleFor(x => x.Username).NotNull();
        RuleFor(x => x.Password).NotNull();
        RuleFor(x => x.Username).NotNull();
        RuleFor(x => x.Email).NotNull();
        RuleFor(x => x.DiscordId).NotNull();
    }
}