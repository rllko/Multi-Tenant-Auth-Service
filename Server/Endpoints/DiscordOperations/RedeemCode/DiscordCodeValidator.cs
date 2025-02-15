using FluentValidation;

namespace Authentication.Endpoints.DiscordOperations.RedeemCode;

public class DiscordCodeValidator : AbstractValidator<RedeemDiscordCodeDto>
{
    public DiscordCodeValidator()
    {
        RuleFor(x => x.discordId)
            .Null().WithMessage("Discord id is required.");

        RuleFor(x => x.code)
            .Null().WithMessage("AccessToken is required.");
    }
}