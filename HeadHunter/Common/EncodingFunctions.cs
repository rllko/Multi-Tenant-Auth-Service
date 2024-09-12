using HeadHunter.Models.Entities;
using HeadHunter.Services;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;

namespace HeadHunter.Common
{
    public static class EncodingFunctions
    {

        internal static readonly char [] chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".ToCharArray();
        public static string GetUniqueKey(int size)
        {

            byte[] data = new byte[4*size];
            using(var crypto = RandomNumberGenerator.Create())
            {
                crypto.GetBytes(data);
            }
            StringBuilder result = new StringBuilder(size);
            for(int i = 0; i < size; i++)
            {
                var rnd = BitConverter.ToUInt32(data, i * 4);
                var idx = rnd % chars.Length;

                result.Append(chars [idx]);
            }

            return result.ToString();
        }

        public static SecurityTokenDescriptor GenerateSecurityTokenDescriptor(User user, DevKeys keys)
        {
            if(user == null)
            {
                return null;
            }

            // Create token to send to the user
            return new SecurityTokenDescriptor
            {
                Audience = IdentityData.Audience,
                Issuer = IdentityData.Issuer,
                Expires = DateTime.Now.AddDays(30),
                NotBefore = DateTime.Now,
                Claims = new Dictionary<string, object>()
                {
                    [JwtRegisteredClaimNames.Jti] = user.License,
                    [JwtRegisteredClaimNames.Sub] = user.Id,
                    ["Hwid"] = user.Hwid,
                    [JwtRegisteredClaimNames.Iat] = new DateTimeOffset(DateTime.Now).ToUnixTimeSeconds()
                },
                SigningCredentials = new SigningCredentials(new RsaSecurityKey(keys.RsaSignKey), SecurityAlgorithms.RsaSha256),
                EncryptingCredentials = new EncryptingCredentials(new RsaSecurityKey(keys.RsaEncryptKey),
                SecurityAlgorithms.RsaOAEP, SecurityAlgorithms.Aes256CbcHmacSha512)
            };
        }
    }

}
