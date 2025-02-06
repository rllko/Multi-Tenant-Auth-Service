namespace Authentication.Services.ClientComponents;

public interface IOffsetService
{
    public Task<Stream?> GetOffsets(string link);
    public bool SetOffsets(string offsets);
}