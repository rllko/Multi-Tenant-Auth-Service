namespace Authentication.Endpoints;

public record ExceptionResponse(string ExceptionMessage, string? StackTrace = null);