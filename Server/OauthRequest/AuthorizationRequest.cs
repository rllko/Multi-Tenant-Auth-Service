namespace Authentication.OauthRequest;

public class AuthorizationRequest
{
    /// <summary>
    ///     Response Type, is required
    /// </summary>
    public string? response_type { get; init; }

    /// <summary>
    ///     Client Id, is required
    /// </summary>

    public string? client_id { get; init; }

    /// <summary>
    ///     Optional
    /// </summary>
    public string? scope { get; init; }

    /// <summary>
    ///     Return the State in the result
    ///     if it was present in the client authorization request
    /// </summary>
    public string? state { get; init; }

    /// <summary>
    ///     if is not null so the client use Pkce
    /// </summary>
    public string? code_challenge { get; init; }

    /// <summary>
    ///     Hasher type for <see cref="code_challenge" />
    /// </summary>
    public string? code_challenge_method { get; init; }
}