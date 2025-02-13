using Authentication.Models.Entities;
using FluentValidation;

namespace Authentication.Validators;

public class HwidValidator : AbstractValidator<HwidDto>
{
    public HwidValidator()
    {
        RuleFor(x => x.bios).NotNull()
            .Length(64).WithMessage("Invalid bios hwid length.")
            .WithMessage("Please specify a valid bios.");
        RuleFor(x => x.cpu)
            .Length(64).WithMessage("Invalid cpu hwid length.")
            .NotNull().WithMessage("Please specify a valid cpu.");
        RuleFor(x => x.disk)
            .Length(64).WithMessage("Invalid disk hwid length.")
            .NotNull()
            .WithMessage("Please specify a valid disk.");
        RuleFor(x => x.ram)
            .Length(64).WithMessage("Invalid ram hwid length.")
            .NotNull()
            .WithMessage("Please specify a valid ram.");
        RuleFor(x => x.display)
            .Length(64).WithMessage("Invalid display hwid length.")
            .NotNull()
            .WithMessage("Please specify a valid display.");
    }
}