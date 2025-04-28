using Authentication.Services;
using FastEndpoints;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Authentication.Endpoints.DiscordOperationEndpoints.Accounts;

public class ChangePasswordRequest
{
    public string NewPassword { get; set; } = null!;
    public string OldPassword { get; set; } = null!;
    public string Username { get; set; } = null!;
}

public class ChangePasswordEndpoint : Endpoint<ChangePasswordRequest, Results<Ok, BadRequest<ValidationFailed>>>
{
    public override void Configure()
    {
        base.Configure();
    }

    public override Task<Results<Ok, BadRequest<ValidationFailed>>> ExecuteAsync(ChangePasswordRequest req,
        CancellationToken ct)
    {
        return base.ExecuteAsync(req, ct);
    }
}