using Authentication.Services;
using FastEndpoints;

namespace Authentication.Endpoints;

public class RandomPWTest : EndpointWithoutRequest<string>
{
    public override void Configure()
    {
        Get("test");
        AllowAnonymous();
    }

    public override Task<string> ExecuteAsync(CancellationToken ct)
    {
        return Task.FromResult(PasswordHashing.GenerateRandomPassword());
    }
}