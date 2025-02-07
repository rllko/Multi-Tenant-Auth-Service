using Authentication.Models.Entities;
using Authentication.Models.Entities.Discord;
using FluentValidation;

namespace Authentication.Validators.Discord;

public class DiscordUserValidator : AbstractValidator<DiscordUser>
{
    public DiscordUserValidator()
    {
        RuleFor(x => x.DiscordId)
            .NotNull().WithMessage("DiscordId cannot be null.")
            .GreaterThan(100000000000000000)
            .WithMessage("Please specify a valid Discord Id");

        RuleFor(x => x.Email)
            .EmailAddress()
            .WithMessage("Please specify a valid email address");
    }
}