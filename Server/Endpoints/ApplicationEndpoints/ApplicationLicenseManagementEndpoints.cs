using Authentication.Attributes;
using Authentication.Database;
using Authentication.Models;
using Authentication.Models.Entities;
using Authentication.RequestProcessors;
using Authentication.Services;
using Authentication.Services.Applications;
using Authentication.Services.Licenses;
using Authentication.Services.Licenses.Builder;
using Authentication.Services.Licenses.Sessions;
using Authentication.Services.Logging.Enums;
using Authentication.Services.Logging.Interfaces;
using FastEndpoints;
using static Authentication.Endpoints.ApplicationEndpoints.ApplicationLicenseEndpointHelpers;

namespace Authentication.Endpoints.ApplicationEndpoints;

public record CreateLicenseRequest(
    int ExpiresInDays,
    short? MaxSessions,
    string? Email,
    string? Username,
    string? Password,
    bool? GenerateKey,
    string? CustomKey);

public record UpdateLicenseRequest(
    string? Email,
    string? Username,
    short? MaxSessions,
    int? ExpiresInDays,
    long? ExpiresAt,
    bool? Paused);

public record ExtendLicenseRequest(
    int Amount,
    string Unit,
    string? Reason);

public record LicenseReasonRequest(string? Reason);

public record LicenseDeleteResponse(long LicenseId, bool Deleted, int HadActiveSessions);

public class CreateApplicationLicenseEndpoint(
    IApplicationService applicationService,
    ILicenseBuilder licenseBuilder,
    IActivityLoggerService activityLogger)
    : Endpoint<CreateLicenseRequest, LicenseDto>
{
    public override void Configure()
    {
        Post("/teams/{teamId:guid}/apps/{appId:guid}/licenses");
        PreProcessor<TenantProcessor<CreateLicenseRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("license.create")));

        Summary(s =>
        {
            s.Summary = "Create an application license";
            s.Description = "Creates one license for the application. Body: { expiresInDays: int > 0, maxSessions?: short >= 0, email?: string, username?: string, password?: string, generateKey?: bool, customKey?: GUID or 22-character key }. Returns the created license including its display key. Bearer auth; requires license.create.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
            s.Response<LicenseDto>(200, "Created license: { id, value, creationDate, activated, paused, banned, revoked, revokedAt, expirationDate, email, username, maxSessions, discord }");
            s.Response<ErrorResponse>(400, "Invalid request, expiresInDays <= 0, maxSessions < 0, invalid customKey, or license builder validation failure");
            s.Response(403, "Not a team member, missing scope, or app is outside this team");
        });
    }

    public override async Task HandleAsync(CreateLicenseRequest req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var appId = Route<Guid>("appId");
        if (await EnsureAppOwnershipAsync(HttpContext, applicationService, teamId, appId, ct) is false) return;

        if (req.ExpiresInDays <= 0)
        {
            AddError("expiresInDays must be greater than zero");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        if (req.MaxSessions is < 0)
        {
            AddError("maxSessions cannot be negative");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        if (TryParseCustomKey(req.CustomKey, out var customValue, out var customKeyError) is false)
        {
            AddError(customKeyError!);
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        var result = await licenseBuilder.CreateLicenseAsync(appId, req.ExpiresInDays, req.MaxSessions, null,
            req.Username, req.Email, req.Password, customValue, null);

        await result.Match(
            async license =>
            {
                var session = HttpContext.Items["Session"] as TenantSessionInfo;
                activityLogger.LogEvent(ActivityEventType.LicenseCreated, license.Id.ToString(),
                    session!.TenantId.ToString(), new
                    {
                        TeamId = teamId,
                        AppId = appId,
                        LicenseId = license.Id,
                        license.ExpiresAt,
                        license.MaxSessions,
                        ActorTenantId = session.TenantId
                    });

                await SendOkAsync(license.MapToDto(), ct);
            },
            async failed =>
            {
                foreach (var error in failed.Errors) AddError(error.ErrorMessage);
                await SendErrorsAsync(cancellation: ct);
            });
    }

    private static bool TryParseCustomKey(string? customKey, out Guid? customValue, out string? error)
    {
        customValue = null;
        error = null;
        if (string.IsNullOrWhiteSpace(customKey)) return true;

        if (Guid.TryParse(customKey, out var parsedGuid))
        {
            customValue = parsedGuid;
            return true;
        }

        if (customKey.Length == 22)
        {
            try
            {
                customValue = Guider.ToGuidFromString(customKey);
                return true;
            }
            catch
            {
                // handled below
            }
        }

        error = "customKey must be a GUID or a 22-character license key";
        return false;
    }
}

public class GetApplicationLicenseEndpoint(
    IApplicationService applicationService,
    ILicenseService licenseService)
    : EndpointWithoutRequest<LicenseDto>
{
    public override void Configure()
    {
        Get("/teams/{teamId:guid}/apps/{appId:guid}/licenses/{licenseId:long}");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("license.retrieve_info")));

        Summary(s =>
        {
            s.Summary = "Get an application license";
            s.Description = "Returns a single license only when it belongs to the routed application. No request body. Bearer auth; requires license.retrieve_info.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
            s.Params["licenseId"] = "License id";
            s.Response<LicenseDto>(200, "License: { id, value, creationDate, activated, paused, banned, revoked, revokedAt, expirationDate, email, username, maxSessions, discord }");
            s.Response<ErrorResponse>(400, "Validation failure");
            s.Response(403, "Not a team member, missing scope, or app is outside this team");
            s.Response(404, "License not found for this app");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var appId = Route<Guid>("appId");
        if (await EnsureAppOwnershipAsync(HttpContext, applicationService, teamId, appId, ct) is false) return;

        var license = await licenseService.GetLicenseForAppAsync(Route<long>("licenseId"), appId);
        if (license is null)
        {
            await SendNotFoundAsync(ct);
            return;
        }

        await SendOkAsync(license.MapToDto(), ct);
    }
}

public class UpdateApplicationLicenseEndpoint(
    IApplicationService applicationService,
    ILicenseService licenseService,
    IActivityLoggerService activityLogger)
    : Endpoint<UpdateLicenseRequest, LicenseDto>
{
    public override void Configure()
    {
        Put("/teams/{teamId:guid}/apps/{appId:guid}/licenses/{licenseId:long}");
        PreProcessor<TenantProcessor<UpdateLicenseRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("license.update")));

        Summary(s =>
        {
            s.Summary = "Update an application license";
            s.Description = "Partially updates an app license. Body: { email?: string, username?: string, maxSessions?: short >= 0, expiresInDays?: int > 0, expiresAt?: unix seconds, paused?: bool }. If both expiresAt and expiresInDays are supplied, expiresAt wins. Bearer auth; requires license.update.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
            s.Params["licenseId"] = "License id";
            s.Response<LicenseDto>(200, "Updated license: { id, value, creationDate, activated, paused, banned, revoked, revokedAt, expirationDate, email, username, maxSessions, discord }");
            s.Response<ErrorResponse>(400, "Invalid request, maxSessions < 0, expiresInDays <= 0, validation failure, or update failed");
            s.Response(403, "Not a team member, missing scope, or app is outside this team");
            s.Response(404, "License not found for this app");
        });
    }

    public override async Task HandleAsync(UpdateLicenseRequest req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var appId = Route<Guid>("appId");
        if (await EnsureAppOwnershipAsync(HttpContext, applicationService, teamId, appId, ct) is false) return;

        if (req.MaxSessions is < 0)
        {
            AddError("maxSessions cannot be negative");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        if (req.ExpiresInDays is <= 0)
        {
            AddError("expiresInDays must be greater than zero when provided");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        var licenseId = Route<long>("licenseId");
        var license = await licenseService.GetLicenseForAppAsync(licenseId, appId);
        if (license is null)
        {
            await SendNotFoundAsync(ct);
            return;
        }

        var changedFields = new List<string>();
        ApplyIfPresent(req.Email, value => license.Email = value, changedFields, nameof(req.Email));
        ApplyIfPresent(req.Username, value => license.Username = value, changedFields, nameof(req.Username));
        if (req.MaxSessions is not null)
        {
            license.MaxSessions = req.MaxSessions.Value;
            changedFields.Add(nameof(req.MaxSessions));
        }

        if (req.ExpiresAt is not null)
        {
            license.ExpiresAt = req.ExpiresAt.Value;
            changedFields.Add(nameof(req.ExpiresAt));
        }
        else if (req.ExpiresInDays is not null)
        {
            license.ExpiresAt = DateTimeOffset.UtcNow.AddDays(req.ExpiresInDays.Value).ToUnixTimeSeconds();
            changedFields.Add(nameof(req.ExpiresInDays));
        }

        if (req.Paused is not null)
        {
            license.Paused = req.Paused.Value;
            changedFields.Add(nameof(req.Paused));
        }

        var updated = await licenseService.UpdateLicenseAsync(license);
        if (updated is null)
        {
            AddError("license could not be updated");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        var session = HttpContext.Items["Session"] as TenantSessionInfo;
        activityLogger.LogEvent(ActivityEventType.LicenseUpdated, licenseId.ToString(),
            session!.TenantId.ToString(), new
            {
                TeamId = teamId,
                AppId = appId,
                LicenseId = licenseId,
                ActorTenantId = session.TenantId,
                ChangedFields = changedFields
            });

        await SendOkAsync(updated.MapToDto(), ct);
    }

    private static void ApplyIfPresent(string? value, Action<string?> setter, ICollection<string> changedFields,
        string fieldName)
    {
        if (value is null) return;
        setter(value);
        changedFields.Add(fieldName);
    }
}

public class ExtendApplicationLicenseEndpoint(
    IApplicationService applicationService,
    ILicenseService licenseService,
    IActivityLoggerService activityLogger)
    : Endpoint<ExtendLicenseRequest, LicenseDto>
{
    public override void Configure()
    {
        Post("/teams/{teamId:guid}/apps/{appId:guid}/licenses/{licenseId:long}/extend");
        PreProcessor<TenantProcessor<ExtendLicenseRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("license.update")));

        Summary(s =>
        {
            s.Summary = "Extend an application license";
            s.Description = "Extends a license from max(now, current expiration). Body: { amount: int > 0, unit: 'days' | 'months' | 'years', reason?: string }. Logs old/new expiration without logging secrets. Bearer auth; requires license.update.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
            s.Params["licenseId"] = "License id";
            s.Response<LicenseDto>(200, "Extended license: { id, value, creationDate, activated, paused, banned, revoked, revokedAt, expirationDate, email, username, maxSessions, discord }");
            s.Response<ErrorResponse>(400, "amount <= 0, unit is not days/months/years, or validation failure");
            s.Response(403, "Not a team member, missing scope, or app is outside this team");
            s.Response(404, "License not found for this app");
        });
    }

    public override async Task HandleAsync(ExtendLicenseRequest req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var appId = Route<Guid>("appId");
        if (await EnsureAppOwnershipAsync(HttpContext, applicationService, teamId, appId, ct) is false) return;

        if (req.Amount <= 0)
        {
            AddError("amount must be greater than zero");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        var licenseId = Route<long>("licenseId");
        var existing = await licenseService.GetLicenseForAppAsync(licenseId, appId);
        if (existing is null)
        {
            await SendNotFoundAsync(ct);
            return;
        }

        var oldExpiration = existing.ExpiresAt;
        var updated = await licenseService.ExtendLicenseForAppAsync(licenseId, appId, req.Amount, req.Unit);
        if (updated is null)
        {
            AddError("unit must be days, months, or years");
            await SendErrorsAsync(cancellation: ct);
            return;
        }

        var session = HttpContext.Items["Session"] as TenantSessionInfo;
        activityLogger.LogEvent(ActivityEventType.LicenseExtended, licenseId.ToString(),
            session!.TenantId.ToString(), new
            {
                TeamId = teamId,
                AppId = appId,
                LicenseId = licenseId,
                ActorTenantId = session.TenantId,
                req.Amount,
                req.Unit,
                OldExpiresAt = oldExpiration,
                NewExpiresAt = updated.ExpiresAt,
                req.Reason
            });

        await SendOkAsync(updated.MapToDto(), ct);
    }
}

public class DeleteApplicationLicenseEndpoint(
    IApplicationService applicationService,
    ILicenseService licenseService,
    ILicenseSessionService sessionService,
    IActivityLoggerService activityLogger,
    IDbConnectionFactory connectionFactory)
    : EndpointWithoutRequest<LicenseDeleteResponse>
{
    public override void Configure()
    {
        Delete("/teams/{teamId:guid}/apps/{appId:guid}/licenses/{licenseId:long}");
        PreProcessor<TenantProcessor<EmptyRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("license.delete")));

        Summary(s =>
        {
            s.Summary = "Delete an application license";
            s.Description = "Deletes one license if it belongs to the routed application. No request body. Sessions cascade via FK; response includes the active session count observed before delete. Bearer auth; requires license.delete.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
            s.Params["licenseId"] = "License id";
            s.Response<LicenseDeleteResponse>(200, "Deletion result: { licenseId, deleted, hadActiveSessions }");
            s.Response<ErrorResponse>(400, "Validation failure");
            s.Response(403, "Not a team member, missing scope, or app is outside this team");
            s.Response(404, "License not found for this app");
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var appId = Route<Guid>("appId");
        if (await EnsureAppOwnershipAsync(HttpContext, applicationService, teamId, appId, ct) is false) return;

        var licenseId = Route<long>("licenseId");
        using var connection = await connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        var existing = await licenseService.GetLicenseForAppAsync(licenseId, appId, transaction);
        if (existing is null)
        {
            transaction.Rollback();
            await SendNotFoundAsync(ct);
            return;
        }

        var activeSessions = (await sessionService.GetSessionsByLicenseAsync(licenseId)).Count();
        var deleted = await licenseService.DeleteLicensesForAppAsync(new[] { licenseId }, appId, transaction);
        transaction.Commit();

        var session = HttpContext.Items["Session"] as TenantSessionInfo;
        activityLogger.LogEvent(ActivityEventType.LicenseDeleted, licenseId.ToString(),
            session!.TenantId.ToString(), new
            {
                TeamId = teamId,
                AppId = appId,
                LicenseId = licenseId,
                ActorTenantId = session.TenantId,
                HadSessions = activeSessions
            });

        await SendOkAsync(new LicenseDeleteResponse(licenseId, deleted > 0, activeSessions), ct);
    }
}

public class BanApplicationLicenseEndpoint(
    IApplicationService applicationService,
    ILicenseService licenseService,
    ILicenseSessionService sessionService,
    IActivityLoggerService activityLogger,
    IDbConnectionFactory connectionFactory)
    : Endpoint<LicenseReasonRequest, LicenseDto>
{
    public override void Configure()
    {
        Post("/teams/{teamId:guid}/apps/{appId:guid}/licenses/{licenseId:long}/ban");
        PreProcessor<TenantProcessor<LicenseReasonRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("license.ban")));

        Summary(s =>
        {
            s.Summary = "Ban an application license";
            s.Description = "Sets banned=true and disables active sessions for the license. Body: { reason?: string }. Logs sessions revoked and reason without logging secrets. Bearer auth; requires license.ban.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
            s.Params["licenseId"] = "License id";
            s.Response<LicenseDto>(200, "Banned license: { id, value, creationDate, activated, paused, banned, revoked, revokedAt, expirationDate, email, username, maxSessions, discord }");
            s.Response<ErrorResponse>(400, "Validation failure");
            s.Response(403, "Not a team member, missing scope, or app is outside this team");
            s.Response(404, "License not found for this app");
        });
    }

    public override async Task HandleAsync(LicenseReasonRequest req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var appId = Route<Guid>("appId");
        if (await EnsureAppOwnershipAsync(HttpContext, applicationService, teamId, appId, ct) is false) return;

        var licenseId = Route<long>("licenseId");
        using var connection = await connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        var updated = await licenseService.SetLicenseBannedAsync(licenseId, appId, true, transaction);
        if (updated is null)
        {
            transaction.Rollback();
            await SendNotFoundAsync(ct);
            return;
        }

        var sessionsRevoked = await sessionService.RevokeSessionsByLicenseAsync(licenseId, transaction);
        transaction.Commit();

        var session = HttpContext.Items["Session"] as TenantSessionInfo;
        activityLogger.LogEvent(ActivityEventType.LicenseBanned, licenseId.ToString(),
            session!.TenantId.ToString(), new
            {
                TeamId = teamId,
                AppId = appId,
                LicenseId = licenseId,
                ActorTenantId = session.TenantId,
                SessionsRevoked = sessionsRevoked,
                req.Reason
            });

        await SendOkAsync(updated.MapToDto(), ct);
    }
}

public class UnbanApplicationLicenseEndpoint(
    IApplicationService applicationService,
    ILicenseService licenseService,
    IActivityLoggerService activityLogger)
    : Endpoint<LicenseReasonRequest, LicenseDto>
{
    public override void Configure()
    {
        Post("/teams/{teamId:guid}/apps/{appId:guid}/licenses/{licenseId:long}/unban");
        PreProcessor<TenantProcessor<LicenseReasonRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("license.ban")));

        Summary(s =>
        {
            s.Summary = "Unban an application license";
            s.Description = "Sets banned=false for a license. Body: { reason?: string }. Logs reason without logging secrets. Bearer auth; requires license.ban.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
            s.Params["licenseId"] = "License id";
            s.Response<LicenseDto>(200, "Unbanned license: { id, value, creationDate, activated, paused, banned, revoked, revokedAt, expirationDate, email, username, maxSessions, discord }");
            s.Response<ErrorResponse>(400, "Validation failure");
            s.Response(403, "Not a team member, missing scope, or app is outside this team");
            s.Response(404, "License not found for this app");
        });
    }

    public override async Task HandleAsync(LicenseReasonRequest req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var appId = Route<Guid>("appId");
        if (await EnsureAppOwnershipAsync(HttpContext, applicationService, teamId, appId, ct) is false) return;

        var licenseId = Route<long>("licenseId");
        var updated = await licenseService.SetLicenseBannedAsync(licenseId, appId, false);
        if (updated is null)
        {
            await SendNotFoundAsync(ct);
            return;
        }

        var session = HttpContext.Items["Session"] as TenantSessionInfo;
        activityLogger.LogEvent(ActivityEventType.LicenseUnbanned, licenseId.ToString(),
            session!.TenantId.ToString(), new
            {
                TeamId = teamId,
                AppId = appId,
                LicenseId = licenseId,
                ActorTenantId = session.TenantId,
                req.Reason
            });

        await SendOkAsync(updated.MapToDto(), ct);
    }
}

public class RevokeApplicationLicenseEndpoint(
    IApplicationService applicationService,
    ILicenseService licenseService,
    ILicenseSessionService sessionService,
    IActivityLoggerService activityLogger,
    IDbConnectionFactory connectionFactory)
    : Endpoint<LicenseReasonRequest, LicenseDto>
{
    public override void Configure()
    {
        Post("/teams/{teamId:guid}/apps/{appId:guid}/licenses/{licenseId:long}/revoke");
        PreProcessor<TenantProcessor<LicenseReasonRequest>>();
        DontThrowIfValidationFails();
        Options(x => x.WithMetadata(new RequiresScopeAttribute("license.ban")));

        Summary(s =>
        {
            s.Summary = "Revoke an application license";
            s.Description = "Sets revoked=true/revokedAt and disables active sessions. Body: { reason?: string }. Logs revokedAt, sessions revoked, and reason without logging secrets. Bearer auth; requires license.ban.";
            s.Params["teamId"] = "Team id (GUID)";
            s.Params["appId"] = "Application id (GUID)";
            s.Params["licenseId"] = "License id";
            s.Response<LicenseDto>(200, "Revoked license: { id, value, creationDate, activated, paused, banned, revoked, revokedAt, expirationDate, email, username, maxSessions, discord }");
            s.Response<ErrorResponse>(400, "Validation failure");
            s.Response(403, "Not a team member, missing scope, or app is outside this team");
            s.Response(404, "License not found for this app");
        });
    }

    public override async Task HandleAsync(LicenseReasonRequest req, CancellationToken ct)
    {
        var teamId = Route<Guid>("teamId");
        var appId = Route<Guid>("appId");
        if (await EnsureAppOwnershipAsync(HttpContext, applicationService, teamId, appId, ct) is false) return;

        var licenseId = Route<long>("licenseId");
        var revokedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        using var connection = await connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction();

        var updated = await licenseService.SetLicenseRevokedAsync(licenseId, appId, revokedAt, transaction);
        if (updated is null)
        {
            transaction.Rollback();
            await SendNotFoundAsync(ct);
            return;
        }

        var sessionsRevoked = await sessionService.RevokeSessionsByLicenseAsync(licenseId, transaction);
        transaction.Commit();

        var session = HttpContext.Items["Session"] as TenantSessionInfo;
        activityLogger.LogEvent(ActivityEventType.LicenseRevoked, licenseId.ToString(),
            session!.TenantId.ToString(), new
            {
                TeamId = teamId,
                AppId = appId,
                LicenseId = licenseId,
                ActorTenantId = session.TenantId,
                RevokedAt = revokedAt,
                SessionsRevoked = sessionsRevoked,
                req.Reason
            });

        await SendOkAsync(updated.MapToDto(), ct);
    }
}

internal static class ApplicationLicenseEndpointHelpers
{
    public static async Task<bool> EnsureAppOwnershipAsync(Microsoft.AspNetCore.Http.HttpContext httpContext,
        IApplicationService applicationService, Guid teamId, Guid appId, CancellationToken ct)
    {
        if (await applicationService.ApplicationBelongsToTeamAsync(teamId, appId)) return true;

        httpContext.Response.StatusCode = StatusCodes.Status403Forbidden;
        await httpContext.Response.CompleteAsync();
        return false;
    }
}
