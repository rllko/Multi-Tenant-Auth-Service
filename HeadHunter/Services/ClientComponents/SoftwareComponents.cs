
using HeadHunter.Models.Context;
using System.Net.Http.Headers;

namespace HeadHunter.Services.ClientComponents;

public class SoftwareComponents : ISoftwareComponents
{
    private readonly HeadhunterDbContext _dbContext;

    public SoftwareComponents(HeadhunterDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Stream?> GetOffsets(string link)
    {
        if(string.IsNullOrEmpty(link))
        {
            return null;
        }

        using var _httpClient = new HttpClient();
        var data = await _httpClient.GetAsync(link);

        if(data.EnsureSuccessStatusCode() == null)
        {
            return null;
        }
        data.Content.Headers.ContentType = new MediaTypeHeaderValue("APPLICATION/octet-stream");
        var content = data.Content;
        return await content.ReadAsStreamAsync();
    }

    public async Task<bool> SetOffsets(string offsets)
    {
        if(string.IsNullOrEmpty(offsets))
        {
            return false;
        }

        return true;
    }
}
