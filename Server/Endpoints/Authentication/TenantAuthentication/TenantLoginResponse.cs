using Authentication.Models;
using Authentication.Models.Entities;

namespace Authentication.Endpoints.Authentication.TenantAuthentication;

public class TenantLoginResponse
{
    public TenantSessionInfo session { get; set; }
    public Tenant tenant { get; set; }
}