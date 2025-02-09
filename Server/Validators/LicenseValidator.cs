using Authentication.Models.Entities;
using FluentValidation;

namespace Authentication.Validators;

public class LicenseValidator : AbstractValidator<License>
{
    public LicenseValidator()
    {
        RuleFor(x => x.DiscordUser)
            .NotNull()
            .WithMessage(x => $"License {x.Value} is not active");
    }

    private static bool BeValid(License license)
    {
        return license.Hw is null && license.DiscordUser is not null;
    }
}