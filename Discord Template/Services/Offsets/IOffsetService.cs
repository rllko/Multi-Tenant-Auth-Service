namespace DiscordTemplate.Services.Offsets
{
    public interface IOffsetService
    {
        public Task<Stream?> GetOffsets(string accessToken, string filename);
        public Task<bool> SetOffsets(string accessToken, string offsetString, string filename);
    }
}
