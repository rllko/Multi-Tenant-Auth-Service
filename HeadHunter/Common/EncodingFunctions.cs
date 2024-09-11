using HeadHunter.Services;
using System.Security.Cryptography;
using System.Text;

namespace HeadHunter.Common
{
    public static class EncodingFunctions
    {
        public static string EncodeAesJwt(string token, DevKeys devKeys)
        {
            byte[] iv = RandomNumberGenerator.GetBytes(16); // For AES

            ICryptoTransform encryptor = devKeys.AesKey.CreateEncryptor(devKeys.AesKey.Key, devKeys.AesKey.IV);

            using(MemoryStream ms = new MemoryStream())
            {
                using(CryptoStream cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                {
                    using(StreamWriter sw = new StreamWriter(cs))
                    {
                        sw.Write(token);
                    }
                }
                return string.Join(",", iv) + "|.!" + Convert.ToBase64String(ms.ToArray());
            }

        }


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
    }
}
