using System.Data;
using System.Security.Cryptography;
using Authentication.Database;
using Authentication.Models.Entities;
using Dapper;
using LanguageExt;

namespace Authentication.Services.Applications;

public class ApplicationService(IDbConnectionFactory connectionFactory) : IApplicationService
{
    public async Task<Option<ApplicationDto>> GetApplicationByIdAsync(Guid applicationId)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();

        const string getApplicationQuery = @"SELECT * FROM applications WHERE id = @Id;";

        var application = await
            connection.QueryFirstOrDefaultAsync<ApplicationDto>(getApplicationQuery, new { Id = applicationId });

        return application;
    }

    public async Task<IEnumerable<ApplicationDto>> GetAllApplicationsAsync()
    {
        using var connection = await connectionFactory.CreateConnectionAsync();

        const string getDiscordIdQuery = @"SELECT * FROM applications;";

        await using var multi = await connection.QueryMultipleAsync(getDiscordIdQuery);

        var licenses = (await multi.ReadAsync<dynamic>()).Select(x => new ApplicationDto
        {
            Id = x.id,
            Name = x.name,
            Description = x.description
        }).ToList();

        return licenses;
    }

    public async Task<Option<IEnumerable<ApplicationDto>>> GetApplicationsByTeamIdAsync(Guid teamId)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();

        const string getApplicationTeamsQuery = @"SELECT * FROM applications WHERE team = @Id;";

        var applications =
            await connection.QueryAsync<ApplicationDto>(getApplicationTeamsQuery, new { Id = teamId });

        return Option<IEnumerable<ApplicationDto>>.Some(applications);
    }

    public async Task<ApplicationDto> UpdateApplicationAsync(Guid applicationId, UpdateApplicationDto applicationDto,
        IDbTransaction? transaction)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();
        var transact = transaction ?? connection.BeginTransaction();

        const string query = @"
            UPDATE applications
            SET
                name = COALESCE(@Name,name),
                description = COALESCE(@Description,description),
                status = COALESCE(@Status,status),
                default_key_schema = COALESCE(@DefaultKeySchema,default_key_schema)
            WHERE id = @Id
            returning id as Id, name as Name, description as Description, status as Status";

        var updatedApplication =
            await connection.QuerySingleAsync<ApplicationDto>(query, new
            {
                applicationDto.Name,
                applicationDto.Description,
                applicationDto.Status,
                applicationDto.DefaultKeySchema,
                Id = applicationId
            }, transact);

        if (transaction == null)
            transact.Commit();

        return updatedApplication;
    }

    public async Task<bool> DeleteApplicationAsync(Guid applicationId, IDbTransaction? transaction)
    {
        using var connection = await connectionFactory.CreateConnectionAsync();

        const string deleteApplicationQuery = @"DELETE FROM applications WHERE id = @Id;";

        var affectedRows =
            await connection.ExecuteAsync(deleteApplicationQuery, new { Id = applicationId }, transaction);

        return affectedRows > 0;
    }

    public async Task<Result<ApplicationDto, ValidationFailed>> RegisterApplicationAsync(Guid teamId,
        IEnumerable<ScopeDto> scopes,
        CreateApplicationDto applicationDto,
        IDbTransaction? transaction
    )
    {
        using var connection = await connectionFactory.CreateConnectionAsync();
        var transact = transaction ?? connection.BeginTransaction();

        var query =
            @"insert into applications (name, description,team) values (@name,@description,@team)
              returning id as Id, name as Name, description as Description, status as Status";

        var newApplication =
            await connection.QuerySingleAsync<ApplicationDto>(query,
                new
                {
                    name = applicationDto.Name,
                    description = applicationDto.Description,
                    team = teamId
                }, transact);

        if (transaction == null)
            transact.Commit();

        return newApplication;
    }

    public async Task<ApplicationCounts> CountApplicationsByTeamAsync(Guid teamId)
    {
        const string sql = @"
            SELECT count(*)::int as Total,
                   (count(*) FILTER (WHERE status <> 'active'))::int as Inactive
            FROM applications
            WHERE team = @TeamId;";

        using var connection = await connectionFactory.CreateConnectionAsync();

        return await connection.QuerySingleAsync<ApplicationCounts>(sql, new { TeamId = teamId });
    }

    public async Task<bool> ApplicationBelongsToTeamAsync(Guid teamId, Guid appId)
    {
        const string sql = @"
            SELECT EXISTS (
                SELECT 1
                FROM applications
                WHERE id = @AppId
                  AND team = @TeamId
            );";

        using var connection = await connectionFactory.CreateConnectionAsync();

        return await connection.ExecuteScalarAsync<bool>(sql, new { TeamId = teamId, AppId = appId });
    }

    private string GenerateClientSecret()
    {
#warning move this away to the client
        const int LENGTH = 32;

        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(LENGTH));
    }
}