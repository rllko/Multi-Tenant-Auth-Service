using Authentication.Models.Entities;
using FluentValidation;

namespace Authentication.Endpoints.Sessions;

public class SessionTokenValidator : AbstractValidator<UserSession>
{
    public SessionTokenValidator()
    {
        RuleFor(x => x.Expiration)
            .Must(BeValidSessionToken).WithMessage("Invalid session token")
            .NotNull();

        RuleFor(x => x.AuthorizationToken).NotNull().WithMessage("Malformed authorization token");
    }

    private static bool BeValidSessionToken(DateTime expiration)
    {
        return expiration.ToUniversalTime() < DateTime.UtcNow;
    }
}