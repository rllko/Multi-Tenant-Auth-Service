using FastEndpoints;

namespace Authentication.Controllers.Token;

public class TokenRequest
{
    [FromBody] public required Guid code { get; set; }

    [FromBody] public required string grant_type { get; set; }
}