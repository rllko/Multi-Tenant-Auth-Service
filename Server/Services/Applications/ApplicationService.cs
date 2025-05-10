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
        var connection = await connectionFactory.CreateConnectionAsync();

        const string getApplicationQuery = @"SELECT * FROM applications WHERE id = @Id;";

        var application = await
            connection.QueryFirstOrDefaultAsync<ApplicationDto>(getApplicationQuery, new { Id = applicationId });

        return application;
    }

    public async Task<IEnumerable<ApplicationDto>> GetAllApplicationsAsync()
    {
        var connection = await connectionFactory.CreateConnectionAsync();

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
        var connection = await connectionFactory.CreateConnectionAsync();

        const string getApplicationTeamsQuery = @"SELECT * FROM applications WHERE team = @Id;";

        var application =
            await connection.QueryFirstOrDefaultAsync<ApplicationDto>(getApplicationTeamsQuery, new { Id = teamId });

        return application == null ? Option<ApplicationDto>.None : Option<ApplicationDto>.Some(application);
    }

    public async Task<Result<ApplicationDto, ValidationFailed>> RegisterApplicationAsync(Guid teamId,
        CreateApplicationDto applicationDto)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        var query =
            @"insert into applications (name, description,team) values (@name,@description,@team)";

        var newLicense =
            await connection.ExecuteAsync(query,
                new
                {
                    name = applicationDto.Name,
                    description = applicationDto.Description,
                    applicationDto.Team
                });

        return new ApplicationDto
        {
            Name = applicationDto.Name,
            Description = applicationDto.Description
        };
    }

    public async Task<ApplicationDto> UpdateApplicationAsync(Guid applicationId, UpdateApplicationDto applicationDto,
        IDbTransaction? transaction)
    {
        var connection = await connectionFactory.CreateConnectionAsync();
        var transact = transaction ?? connection.BeginTransaction();

        const string query = @"
            UPDATE applications
            SET 
                name = COALESCE(@Name,name),
                description = COALESCE(@Username,description),
                default_key_schema = COALESCE(@DiscordId,default_key_schema)
            WHERE id = @Id returning *";

        var updatedLicense =
            await connection.QuerySingleAsync<ApplicationDto>(query, new
            {
                applicationDto.Name,
                applicationDto.Description,
                applicationDto.DefaultKeySchema
            }, transact);

        return updatedLicense;
    }

    public async Task<bool> DeleteApplicationAsync(Guid applicationId, IDbTransaction? transaction)
    {
        var connection = await connectionFactory.CreateConnectionAsync();

        const string addDiscordIdQuery = @"DELETE FROM applications WHERE id = @id;";

        var affectedRows1 =
            await connection.ExecuteAsync(addDiscordIdQuery, new { applicationId }, transaction);

        return affectedRows1 > 0;
    }

    private string GenerateClientSecret()
    {
#warning move this away to the client
        const int LENGTH = 32;

        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(LENGTH));
    }
}