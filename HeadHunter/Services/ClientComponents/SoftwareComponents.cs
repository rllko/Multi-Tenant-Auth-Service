
using HeadHunter.Models.Context;
using System.Net.Http.Headers;

namespace HeadHunter.Services.ClientComponents;

public class SoftwareComponents(HeadhunterDbContext dbContext) : ISoftwareComponents
{
    private readonly HeadhunterDbContext _dbContext = dbContext;

    public async Task<Stream?> GetOffsets(string link)
    {
        if(string.IsNullOrEmpty(link))
        {
            return null;
        }

        using var httpClient = new HttpClient();
        var data = await httpClient.GetAsync(link);

        if(data.IsSuccessStatusCode == false)
        {
            return null;
        }
        data.Content.Headers.ContentType = new MediaTypeHeaderValue("APPLICATION/octet-stream");
        var content = data.Content;
        return await content.ReadAsStreamAsync();
    }

    public  bool SetOffsets(string offsets)
    {
        #warning  remember me to set offsets for the software components
        if(string.IsNullOrEmpty(offsets))
        {
            return false;
        }

        return true;
    }
}
