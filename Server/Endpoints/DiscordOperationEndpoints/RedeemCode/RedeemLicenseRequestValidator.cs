using FluentValidation;

namespace Authentication.Endpoints.DiscordOperationEndpoints.RedeemCode;

public class RedeemLicenseRequestValidator : AbstractValidator<RedeemLicenseRequestDto>
{
    public RedeemLicenseRequestValidator()
    {
        RuleFor(x => x.License)
            .Null().WithMessage("License is required.");
        RuleFor(x => x.Email)
            .Null().WithMessage("Email is required.");
        RuleFor(x => x.Username)
            .Null().WithMessage("Username is required.");
        RuleFor(x => x.DiscordId)
            .Null().WithMessage("DiscordId Id required.");
    }
}