using Authentication.Models.Entities;
using FluentValidation;

namespace Authentication.Endpoints.DiscordOperationEndpoints;

public class DiscordUserValidator : AbstractValidator<DiscordUser>
{
    public DiscordUserValidator()
    {
        RuleFor(x => x.DiscordId)
            .NotNull().WithMessage("DiscordId cannot be null.")
            .GreaterThan<DiscordUser, long>(100000000000000000)
            .WithMessage("Please specify a valid DiscordId Id");
    }
}