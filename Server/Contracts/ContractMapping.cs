using Authentication.Common;
using Authentication.Models.Entities;

namespace Authentication.Contracts;

public static class ContractMapping
{
    public static string MapToString(this License license)
    {
        return Guider.ToStringFromGuid(license.Value);
    }

    public static LicenseDto MapToDto(this License license)
    {
        return new LicenseDto(
            CreationDate: license.CreationDate,
            DiscordUser: license.DiscordUser,
            Value: Guider.ToStringFromGuid(license.Value)
        );
    }
}