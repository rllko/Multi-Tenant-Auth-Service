using FluentValidation;

namespace Authentication.Endpoints.DiscordOperations.RedeemCode;

public class DiscordCodeValidator : AbstractValidator<RedeemDiscordCodeDto>
{
    public DiscordCodeValidator()
    {
        RuleFor(x => x.License)
            .Null().WithMessage("License is required.");
        RuleFor(x => x.Email)
            .Null().WithMessage("Email is required.");
        RuleFor(x => x.Username)
            .Null().WithMessage("Username is required.");
        RuleFor(x => x.DiscordId)
            .Null().WithMessage("Discord Id required.");
    }
}