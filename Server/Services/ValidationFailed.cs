using FluentValidation.Results;

namespace Authentication.Services;

public record ValidationFailed(IEnumerable<ValidationFailure> Errors)
{
    public ValidationFailed(ValidationFailure error) : this([error])
    {
    }
}