namespace HeadHunter.Services.ClientComponents
{
    public interface ISoftwareComponents
    {
        public Task<Stream?> GetOffsets(string link);
        public Task<bool> SetOffsets(string offsets);
    }
}
