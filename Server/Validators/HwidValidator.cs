using Authentication.Models.Entities;
using FluentValidation;

namespace Authentication.Validators;

public class HwidValidator : AbstractValidator<Hwid>
{
    public HwidValidator()
    {
        RuleFor(x => x.Bios).NotNull()
            .Length(64).WithMessage("Invalid bios hwid length.")
            .WithMessage("Please specify a valid bios.");
        RuleFor(x => x.Cpu)
            .Length(64).WithMessage("Invalid cpu hwid length.")
            .NotNull().WithMessage("Please specify a valid cpu.");
        RuleFor(x => x.Disk)
            .Length(64).WithMessage("Invalid disk hwid length.")
            .NotNull()
            .WithMessage("Please specify a valid disk.");
        RuleFor(x => x.Ram)
            .Length(64).WithMessage("Invalid ram hwid length.")
            .NotNull()
            .WithMessage("Please specify a valid ram.");
        RuleFor(x => x.Display)
            .Length(64).WithMessage("Invalid display hwid length.")
            .NotNull()
            .WithMessage("Please specify a valid display.");
    }
}