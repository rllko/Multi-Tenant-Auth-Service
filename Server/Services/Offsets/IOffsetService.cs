namespace Authentication.Services.Offsets;

public interface IOffsetService
{
    public Task<Stream?> GetOffsets(string link);
    public bool SetOffsets(string offsets);
}