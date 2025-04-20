using Authentication.Common;
using Authentication.Models.Entities;

namespace Authentication.Contracts;

public static class ContractMapping
{
    public static long ToEpoch(this DateTime dateTime)
    {
        return ((DateTimeOffset)dateTime).ToUnixTimeSeconds();
    }
}