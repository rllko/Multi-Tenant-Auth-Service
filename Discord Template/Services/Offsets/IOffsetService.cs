namespace DiscordTemplate.Services.Offsets
{
    public interface IOffsetService
    {
        public Task<OffsetsResponse<Stream>> GetOffsets(string accessToken, string filename);
        public Task<OffsetsResponse<bool>> SetOffsets(string accessToken, string offsetString, string filename);
    }
}
