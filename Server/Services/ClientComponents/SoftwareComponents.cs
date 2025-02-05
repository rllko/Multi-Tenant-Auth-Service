using System.Net.Http.Headers;
using Authentication.Models.Context;

namespace Authentication.Services.ClientComponents;

public class SoftwareComponents(AuthenticationDbContext dbContext) : ISoftwareComponents
{
    private readonly AuthenticationDbContext _dbContext = dbContext;

    public async Task<Stream?> GetOffsets(string link)
    {
        if (string.IsNullOrEmpty(link)) return null;

        using var httpClient = new HttpClient();
        var data = await httpClient.GetAsync(link);

        if (data.IsSuccessStatusCode == false) return null;
        data.Content.Headers.ContentType = new MediaTypeHeaderValue("APPLICATION/octet-stream");
        var content = data.Content;
        return await content.ReadAsStreamAsync();
    }

    public bool SetOffsets(string offsets)
    {
#warning remember me to set offsets for the software components
        if (string.IsNullOrEmpty(offsets)) return false;

        return true;
    }
}