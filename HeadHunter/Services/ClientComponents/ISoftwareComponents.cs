namespace HeadHunter.Services.ClientComponents
{
    public interface ISoftwareComponents
    {
        public Task<string?> GetOffsets();
        public Task<bool> SetOffsets(string offsets);
    }
}
