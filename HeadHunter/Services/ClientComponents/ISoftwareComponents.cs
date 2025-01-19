namespace HeadHunter.Services.ClientComponents
{
    public interface ISoftwareComponents
    {
        public Task<Stream?> GetOffsets(string link);
        public bool SetOffsets(string offsets);
    }
}
