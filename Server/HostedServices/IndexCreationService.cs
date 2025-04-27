using System.Text.RegularExpressions;
using Authentication.Models;
using Redis.OM;

namespace Authentication.HostedServices;

public class IndexCreationService(RedisConnectionProvider provider) : IHostedService
{
    private readonly Type[] _typesToIndex =
    [
        typeof(TenantSessionInfo)
    ];

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var existingIndexes = (await provider.Connection.ExecuteAsync("FT._LIST"))
            .ToArray()
            .Select(x => x.ToString())
            .ToHashSet();

        foreach (var type in _typesToIndex)
        {
            var name = Regex.Replace(
                    type.Name,
                    "(?<!^)([A-Z][a-z]|(?<=[a-z])[A-Z0-9])",
                    "-$1",
                    RegexOptions.Compiled)
                .Trim()
                .ToLower();

            var indexName = $"{name}-idx";
            if (!existingIndexes.Contains(indexName)) await provider.Connection.CreateIndexAsync(type);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}