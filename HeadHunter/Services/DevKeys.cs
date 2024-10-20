using System.Security.Cryptography;
using NSec.Cryptography;

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
                File.WriteAllText("PublicSignKey.pem", RsaSignKey.ExportRSAPublicKeyPem());
                File.WriteAllBytes("SignKey", privatekey);
            }

            RsaEncryptKey = RSA.Create();
            if(File.Exists("EncryptKey"))
            {
                RsaEncryptKey.ImportRSAPrivateKey(File.ReadAllBytes("EncryptKey"), out _);
            }
            else
            {
                var privatekey = RsaEncryptKey.ExportRSAPrivateKey();
                File.WriteAllBytes("EncryptKey", privatekey);
                
                // Public key export (with a correction for more accuracy from RobSiklos's comment to have the key in PKCS#1 RSAPublicKey format)
                File.WriteAllText("PublicEncryptKey.pem", RsaEncryptKey.ExportRSAPublicKeyPem());
                File.WriteAllText("PublicEncryptPKCEKey.pem", RsaEncryptKey.ExportPkcs8PrivateKeyPem());

                File.WriteAllBytes("EncryptKey", RsaEncryptKey.ExportRSAPrivateKey());
            }

            var alg = AeadAlgorithm.ChaCha20Poly1305;
            
            if(File.Exists("ChaChaRealSmooth"))
            {
                var decryptionKey = File.ReadAllBytes("ChaChaRealSmooth");
                ChaChaKey = Key.Import(alg, decryptionKey, KeyBlobFormat.RawSymmetricKey);
            }
            else
            {
                var rngCsp = RandomNumberGenerator.Create();
                byte[] key = new byte[32];
                rngCsp.GetBytes(key);
                
                File.WriteAllBytes("ChaChaRealSmooth", key);
            }
        }

        public RSA RsaSignKey { get; }
        public RSA RsaEncryptKey { get; }
        public Key ChaChaKey { get; }
    }
}
