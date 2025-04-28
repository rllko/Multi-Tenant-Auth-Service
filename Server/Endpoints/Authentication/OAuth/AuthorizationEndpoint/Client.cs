using Authentication.Common;
using FastEndpoints;

namespace Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;

public class Client
{
    [BindFrom("client_id")] public int ClientId { get; init; }

    [BindFrom("client_identifier")] public required string ClientIdentifier { get; init; }

    [BindFrom("client_secret")] public required string ClientSecret { get; set; }

    [BindFrom("grant_type")]
    public string GrantType { get; init; } = AuthorizationGrantType.Bearer.GetEnumDescription();
    [BindFrom("client_uri")] public required string ClientUri { get; set; }
}