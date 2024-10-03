
using HeadHunter.Models.Context;
using HeadHunter.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace HeadHunter.Services.ClientComponents;

public class SoftwareComponents : ISoftwareComponents
{
    private readonly HeadhunterDbContext _dbContext;
    public SoftwareComponents(HeadhunterDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<string?> GetOffsets()
    {
        var list = await _dbContext.Offsets.FirstOrDefaultAsync();

        if(list is null)
        {
            return null;
        }

        return list?.List;
    }

    public async Task<bool> SetOffsets(string offsets)
    {
        if(string.IsNullOrEmpty(offsets))
        {
            return false;
        }

        foreach(var item in _dbContext.Offsets)
        {
            _dbContext.Offsets.Remove(item);
        }

        try
        {
            await _dbContext.Offsets.AddAsync(new Offset { List = offsets });
            await _dbContext.SaveChangesAsync();

            return true;
        }
        catch(Exception e)
        {
            return false;
        }
    }
}
