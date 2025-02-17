using System.Net.Http.Headers;

namespace Authentication.Services.Offsets;

public class OffsetService : IOffsetService
{
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
        if (string.IsNullOrEmpty(offsets)) return false;

        return true;
    }
}