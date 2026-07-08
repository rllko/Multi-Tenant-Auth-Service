using System.Collections.Generic;

namespace Authentication.Services.Licenses;

internal static class LicenseRowMapper
{
    public static string? ToString(IDictionary<string, object?> values, string key)
    {
        return values.TryGetValue(key, out var value) && value is not null ? Convert.ToString(value) : null;
    }

    public static long? ToLong(IDictionary<string, object?> values, string key)
    {
        return values.TryGetValue(key, out var value) && value is not null ? Convert.ToInt64(value) : null;
    }

    public static short? ToShort(IDictionary<string, object?> values, string key)
    {
        return values.TryGetValue(key, out var value) && value is not null ? Convert.ToInt16(value) : null;
    }

    public static bool ToBool(IDictionary<string, object?> values, string key)
    {
        return values.TryGetValue(key, out var value) && value is bool boolValue && boolValue;
    }

    public static Guid? ToGuid(IDictionary<string, object?> values, string key)
    {
        if (values.TryGetValue(key, out var value) is false || value is null) return null;
        return value switch
        {
            Guid guid => guid,
            string stringValue when Guid.TryParse(stringValue, out var guid) => guid,
            _ => null
        };
    }
}
