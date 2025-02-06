using Authentication.Models;
using Authentication.Models.Entities;

namespace Authentication.Services.Users;

public class Licensemanagerservice : ILicenseManagerService
{
    public async Task<License?> GetLicenseByIdAsync(long LicenseId)
    {
        // var License = await dbContext.Licenses.FirstOrDefaultAsync(License => License.Id == LicenseId);
        return null;
    }

    public async Task<License?> GetLicenseByEmailAsync(string LicenseEmail)
    {
        // var License = await dbContext.Licenses.FirstOrDefaultAsync(License => License.Email == LicenseEmail);
        return null;
    }

    public async Task<License?> GetLicenseByLicenseAsync(string license)
    {
        // var License = await dbContext.Licenses.Include(x => x.DiscordLicenseNavigation)
        // .Include(x => x.Hw)
        // .FirstOrDefaultAsync(License => License.License == license);
        return null;
    }

    public async Task<List<License>?> GetLicenseLicenseListAsync(long discordId)
    {
        // var list = await dbContext.Licenses.Include(x => x.DiscordLicenseNavigation)
        // .Where(License => License.DiscordLicense == discordId).ToListAsync();

        // if (list.Count == 0) return null;

        // return list;
        return null;
    }

    public async Task<License?> GetLicenseByHwidAsync(long id)
    {
        // var License = await dbContext.Licenses.Include(x => x.DiscordLicenseNavigation)
        // .FirstOrDefaultAsync(License => License.Hw != null && License.Hw.Id == id);
        // return License;
        return null;
    }

    public async Task<License?> ConfirmLicenseRegistrationAsync(string license, long discordId, string? email = null)
    {
        if (string.IsNullOrEmpty(license)) return null;

        if (discordId <= 0) return null;

        // var newLicense = await dbContext.Licenses.Include(x => x.DiscordLicenseNavigation)
        // .FirstOrDefaultAsync(License => License.License == license);

        // if (newLicense == null) return null;

        // if (await GetLicenseByDiscordAsync(discordId) == null)
        // await dbContext.DiscordLicenses.AddAsync(new DiscordUser { DiscordId = discordId, DateLinked = DateTime.Now });

        // newLicense.DiscordLicense = discordId;

        // await dbContext.SaveChangesAsync();
        // return newLicense;
        return null;
    }

    public async Task<License?> ConfirmLicenseRegistrationAsync(DiscordCode discordCode)
    {
        // var License = (long)discordCode.License!;

        // return await ConfirmLicenseRegistrationAsync(discordCode.License.License, License, discordCode.License.Email);
        return null;
    }

    public async Task<License?> GetLicenseByDiscordAsync(long discordId)
    {
        // var License = await dbContext.Licenses.Include(x => x.DiscordLicenseNavigation).Where(x => x.DiscordLicense == discordId)
        // .FirstOrDefaultAsync();
        // if (License != null) return License;

        return null;
    }

    public async Task<License?> GetLicenseByPersistanceTokenAsync(string token)
    {
        // if (!Guid.TryParse(token, out var persistanceToken)) return null;

        // var newLicense = await dbContext.Licenses
        // .Include(x => x.Licenseactivitylogs)
        // .Include(x => x.Hw)
        // .FirstOrDefaultAsync(License => License.PersistentToken == token);

        // return newLicense;
        return null;
    }

    public async Task<bool> AssignLicenseHwidAsync(string license, Hwid hwid)
    {
        var License = await GetLicenseByLicenseAsync(license);

        if (License == null) return false;

        await UpdateLicensePersistenceTokenAsync(license);

        License.Hw = hwid;
        // await dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<bool> UpdateLicensePersistenceTokenAsync(string license)
    {
        var License = await GetLicenseByLicenseAsync(license);

        if (License == null) return false;

        // License.PersistentToken = Guid.NewGuid().ToString();
        // License.LastToken = DateTime.Now.ToUniversalTime();
        // await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResetLicensePersistenceToken(string license)
    {
        var License = await GetLicenseByLicenseAsync(license);

        if (License == null) return false;

        // License.PersistentToken = null;
        // License.LastToken = null;
        // await dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResetLicenseHwidAsync(string license)
    {
        var License = await GetLicenseByLicenseAsync(license);

        if (License == null) return false;

        // License.PersistentToken = null;
        // License.LastToken = null;
        // License.KeyResetCount += 1;
        // dbContext.Hwids.Remove(License.Hw!);

        // await dbContext.SaveChangesAsync();

        return true;
    }

    public async Task<int> GetLicenseHwidResetCount(string license)
    {
        // var License = await dbContext.Licenses.Include(x => x.Licenseactivitylogs)
        // .FirstOrDefaultAsync(x => x.License == license);

        // var resetCount = License!.Licenseactivitylogs.Count(x => x.Activitytype == ActivityType.KeyReset.GetEnumDescription()
        // && x.Interactiontime!.Value.Month == DateTime.Now.Month)!;
        // return resetCount;
        return 0;
    }

    public async Task<List<License>> CreateLicenseInBulk(int amount)
    {
        var Licenses = new List<License>();

        if (amount <= 0) return Licenses;

        for (var i = 0; i < amount; i++) Licenses.Add(await CreateLicenseAsync());

        return Licenses;
    }
    // Need to create the bulk creation of Licenses

    public async Task<License?> CreateLicenseAsync(long? discordId = null)
    {
        // var License = new License
        // {
        // DiscordUserNavigation = discordId ?? null
        // };
        //
        // if (discordId != null && await GetLicenseByDiscordAsync((long)discordId) == null)
        //     await dbContext.DiscordLicenses.AddAsync(new DiscordLicense
        //         { DiscordId = (long)discordId, DateLinked = DateTime.Now });
        //
        // await dbContext.Licenses.AddAsync(License);
        // await dbContext.SaveChangesAsync();

        return null;
    }

    public async Task<License?> GetLicenseByPersistenceTokenAsync(string token)
    {
        // var License = await dbContext.Licenses.FirstOrDefaultAsync(License => License.PersistentToken == token);
        // return License;
        return null;
    }
}