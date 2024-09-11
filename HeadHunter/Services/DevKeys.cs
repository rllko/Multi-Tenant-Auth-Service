using System.Security.Cryptography;

namespace HeadHunter.Services
{
    public class DevKeys
    {
        public DevKeys()
        {
            RsaSignKey = RSA.Create();
            if(File.Exists("SignKey"))
            {
                RsaSignKey.ImportRSAPrivateKey(File.ReadAllBytes("SignKey"), out _);
            }
            else
            {
                var privatekey = RsaSignKey.ExportRSAPrivateKey();
                File.WriteAllBytes("SignKey", privatekey);

            }

            RsaEncryptKey = RSA.Create();
            if(File.Exists("EncodeKey"))
            {
                RsaEncryptKey.ImportRSAPrivateKey(File.ReadAllBytes("EncodeKey"), out _);
            }
            else
            {
                var privatekey = RsaEncryptKey.ExportRSAPrivateKey();
                File.WriteAllBytes("EncodeKey", privatekey);

            }

            AesKey = Aes.Create();
            if(File.Exists("aeskey"))
            {
                AesKey.Key = File.ReadAllBytes("aeskey");
                Console.WriteLine(Convert.ToBase64String(AesKey.Key));
            }
            else
            {
                AesKey.KeySize = 256;
                AesKey.GenerateKey();
                File.WriteAllBytes("aeskey", AesKey.Key);

            }
        }

        public RSA RsaSignKey { get; }
        public RSA RsaEncryptKey { get; }
        public Aes AesKey { get; }

    }
}
