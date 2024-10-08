using DiscordTemplate.Services.Data_Fetch;

public class FetchingService : IFetchingService
{
    private readonly HttpClient _httpClient;

    public FetchingService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string> FetchFileContentAsJson(string url)
    {
        using var response = await _httpClient.GetAsync(url);
        return await response.Content.ReadAsStringAsync();
    }
}