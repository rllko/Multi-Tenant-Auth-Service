using System.Security.Cryptography;

namespace HeadHunter.Services
{
    public class DevKeys
    {
        public DevKeys()
        {
            RsaKey = RSA.Create();
            if(File.Exists("key"))
            {
                RsaKey.ImportRSAPrivateKey(File.ReadAllBytes("key"), out _);
            }
            else
            {
                var privatekey = RsaKey.ExportRSAPrivateKey();
                File.WriteAllBytes("key", privatekey);
            }
        }

        public RSA RsaKey { get; }

    }
}
