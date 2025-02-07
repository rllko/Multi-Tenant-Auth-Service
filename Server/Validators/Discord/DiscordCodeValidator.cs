using Authentication.Models;
using FluentValidation;

namespace Authentication.Validators.Discord;

public class DiscordCodeValidator : AbstractValidator<DiscordCode>
{
    public DiscordCodeValidator()
    {
        RuleFor(x => x.License.DiscordUser)
            .Null().WithMessage("This License already has a Discord user assigned to it.");

        RuleFor(x => x.CreationTime)
            .Must(x => BeValid(x, 30))
            .WithMessage("This code is expired");
    }

    private static bool BeValid(DateTime time, int minutesUntilExpire)
    {
        return time.AddMinutes(minutesUntilExpire).ToUniversalTime() <= DateTime.UtcNow;
    }
}