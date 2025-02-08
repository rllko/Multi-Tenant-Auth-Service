using Authentication.Models.Entities;
using FluentValidation;
using FluentValidation.Results;

namespace Authentication.Validators;

public class LicenseValidator : AbstractValidator<License>
{
    public LicenseValidator()
    {
        RuleFor(x => x.DiscordUser)
            .NotNull()
            .WithMessage("Please specify a valid license");
    }

    private static bool BeValid(License license)
    {
        return license.Hw is null && license.DiscordUser is not null;
    }

    public record ValidationFailed(IEnumerable<ValidationFailure> Errors);
}