using Authentication.Models.Entities;
using FluentValidation;

namespace Authentication.Endpoints.Sessions;

public class SessionTokenValidator : AbstractValidator<UserSession>
{
    public SessionTokenValidator()
    {
        RuleFor(x => x.ExpirationTime)
            .Must(x => x > 0).WithMessage("Invalid session token")
            .NotNull();

        RuleFor(x => x.AuthorizationToken).NotNull().WithMessage("Malformed authorization token");
    }
}