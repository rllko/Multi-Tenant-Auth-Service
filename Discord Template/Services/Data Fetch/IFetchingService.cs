namespace DiscordTemplate.Services.Data_Fetch
{
    public interface IFetchingService
    {
        public Task<string> FetchFileContentAsJson(string path);
    }
}
