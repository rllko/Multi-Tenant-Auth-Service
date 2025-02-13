using System.Security.Cryptography;
using NSec.Cryptography;

namespace Authentication.Services;

public class DevKeys
{
    private const string SignKeyName = "./keys/SignKey";

    private const string ChaCha20KeyName = "./keys/ChaCha20Key";

    public DevKeys()
    {
        RsaSignKey = RSA.Create();
        if (File.Exists(SignKeyName))
        {
            RsaSignKey.ImportRSAPrivateKey(File.ReadAllBytes(SignKeyName), out _);
        }
        else
        {
            var privatekey = RsaSignKey.ExportRSAPrivateKey();
            File.WriteAllText(SignKeyName + ".pem", RsaSignKey.ExportRSAPublicKeyPem());
            File.WriteAllBytes(SignKeyName, privatekey);
        }

        var alg = AeadAlgorithm.ChaCha20Poly1305;

        if (File.Exists(ChaCha20KeyName))
        {
            var decryptionKey = File.ReadAllBytes(ChaCha20KeyName);
            ChaChaKey = Key.Import(alg, decryptionKey, KeyBlobFormat.RawSymmetricKey);
        }
        else
        {
            var rngCsp = RandomNumberGenerator.Create();
            var key = new byte[32];
            rngCsp.GetBytes(key);

            File.WriteAllBytes(ChaCha20KeyName, key);
        }
    }

    public RSA RsaSignKey { get; init; }
    public Key ChaChaKey { get; init; }
}