using FluentValidation.Results;

namespace Authentication.Validators;

public record ValidationFailed(IEnumerable<ValidationFailure> Errors);