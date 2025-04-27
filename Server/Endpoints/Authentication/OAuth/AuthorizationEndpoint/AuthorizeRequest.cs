using FastEndpoints;

namespace Authentication.Endpoints.Authorization;

public class AuthorizeRequest
{
    /// <summary>
    ///     Response Type, is required
    /// </summary>
    [BindFrom("response_type")]
    public string? ResponseType { get; init; } = "token";

    /// <summary>
    ///     Client Id, is required
    /// </summary>
    [BindFrom("client_id")]
    public string? ClientId { get; init; }

    /// <summary>
    ///     Return the State in the result
    ///     if it was present in the client authorization request
    /// </summary>
    [BindFrom("state")]
    public string? State { get; init; }
}