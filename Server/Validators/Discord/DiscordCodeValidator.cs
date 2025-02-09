using Authentication.Models.Entities.Discord;
using FluentValidation;

namespace Authentication.Validators.Discord;

public class DiscordCodeValidator : AbstractValidator<RedeemDiscordCodeDto>
{
    public DiscordCodeValidator()
    {
        RuleFor(x => x.discordId)
            .Null().WithMessage("Discord id is required.");

        RuleFor(x => x.code)
            .Null().WithMessage("Code is required.");
    }
}