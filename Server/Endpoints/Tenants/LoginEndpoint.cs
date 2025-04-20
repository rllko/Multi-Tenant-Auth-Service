using Authentication.Models;
using FastEndpoints.Security;

namespace Authentication.Endpoints.Tenants;

using FastEndpoints;
using Redis.OM;
using Redis.OM.Searching;

public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
    public string TenantId { get; set; }
}

public class LoginResponse
{
    public string SessionToken { get; set; }
}

public class LoginEndpoint : Endpoint<LoginRequest, LoginResponse>
{
    private readonly IRedisCollection<TenantSessionInfo> _sessions;
    private readonly RedisConnectionProvider _provider;

    public LoginEndpoint(RedisConnectionProvider provider)
    {
        _provider = provider;
        _sessions = provider.RedisCollection<TenantSessionInfo>();
    }

    public override void Configure()
    {
        Post("/auth/login");
        AllowAnonymous();
    }

    public override async Task HandleAsync(LoginRequest req, CancellationToken ct)
    {

        // 🔐 Validate user (replace with your actual logic)
        var userId = await FakeUserValidation(req.Username, req.Password, req.TenantId);
        if (userId is null || Guid.TryParse(req.TenantId, out var tenantId))
        {
            await SendUnauthorizedAsync(ct);
            return;
        }

        // 🪪 Generate session token
        var token = Guid.NewGuid().ToString("N");
        var now = DateTime.UtcNow;

        var session = new TenantSessionInfo
        {
            SessionToken = token,
            TenantId = tenantId,
            Ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            UserAgent = HttpContext.Request.Headers["User-Agent"],
            Created = now,
            Expires = now.AddHours(1)
        };

        await _sessions.InsertAsync(session,TimeSpan.FromSeconds(3600));

        CookieAuth.SignInAsync(u =>
        {
            u.Roles.Add("Admin");
            u.Permissions.AddRange(new[] { "Create_Item", "Delete_Item" });
            u.Claims.Add(new("Address", "123 Street"));

            //indexer based claim setting
            u["Email"] = "abc@def.com";
            u["Department"] = "Administration";
        });
    }

    // ⛔ Replace this with real authentication logic
    private async Task<string?> FakeUserValidation(string username, string password, string tenantId)
    {
        await Task.Delay(50); // simulate I/O
        return username == "admin" && password == "password" ? "user-123" : null;
    }
}