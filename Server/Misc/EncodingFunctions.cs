using System.Security.Cryptography;
using System.Text;
using Authentication.Models.Entities;
using Authentication.Services;
using Microsoft.IdentityModel.Tokens;

namespace Authentication.Common;

public static class EncodingFunctions
{
    internal static readonly char[] chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".ToCharArray();

    public static string GetUniqueKey(int size)
    {
        var data = new byte[4 * size];
        using (var crypto = RandomNumberGenerator.Create())
        {
            crypto.GetBytes(data);
        }

        var result = new StringBuilder(size);
        for (var i = 0; i < size; i++)
        {
            var rnd = BitConverter.ToUInt32(data, i * 4);
            var idx = rnd % chars.Length;

            result.Append(chars[idx]);
        }

        return result.ToString();
    }


    public static SecurityTokenDescriptor? GenerateSecurityTokenDescriptor(License user, DevKeys keys)
    {
        // const int ExpireDays = 7;
        //
        // if (user is null) return null;
        //
        // // Create token to send to the user
        // return new SecurityTokenDescriptor
        // {
        //     Audience = IdentityData.Audience,
        //     Issuer = IdentityData.Issuer,
        //     IssuedAt = DateTime.Now,
        //     Expires = user.LastToken!.Value.AddDays(ExpireDays),
        //     Claims = new Dictionary<string, object>
        //     {
        //         [JwtRegisteredClaimNames.Jti] = user.License,
        //         [JwtRegisteredClaimNames.AuthTime] = user.LastToken,
        //         ["PersistenceToken"] = user.PersistentToken!,
        //         ["Hwid"] = user.Hwid!
        //     },
        //     SigningCredentials =
        //         new SigningCredentials(new RsaSecurityKey(keys.RsaSignKey), SecurityAlgorithms.RsaSha256)
        // };º
        return null;
    }
}