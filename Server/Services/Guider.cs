using System.Buffers.Text;
using System.Runtime.InteropServices;

namespace Authentication.Services;

/// <summary>
/// This class is used in the license sessions to transform the session id from uuid to a random format
/// </summary>
public static class Guider
{
    private const char EqualsChar = '=';
    private const char Hyphen = '-';
    private const char Underscore = '_';
    private const char Slash = '/';
    private const byte SlashByte = (byte)'/';
    private const char Plus = '+';
    private const byte PlusByte = (byte)'+';

    public static Guid ToGuidFromString(string id)
    {
        Span<char> base64Chars = stackalloc char[24];

        for (var i = 0; i < 22; i++)
            base64Chars[i] = id[i] switch
            {
                Hyphen => Slash,
                Underscore => Plus,
                _ => id[i]
            };

        base64Chars[22] = EqualsChar;
        base64Chars[23] = EqualsChar;

        Span<byte> idBytes = stackalloc byte[16];
        Convert.TryFromBase64Chars(base64Chars, idBytes, out _);
        return new Guid(idBytes);
    }

    public static string ToStringFromGuid(Guid id)
    {
        Span<byte> idbytes = stackalloc byte[16];
        Span<byte> base64Bytes = stackalloc byte[24];

        MemoryMarshal.TryWrite(idbytes, in id);
        Base64.EncodeToUtf8(idbytes, base64Bytes, out _, out _);

        Span<char> finalChars = stackalloc char[22];

        for (var i = 0; i < 22; i++)
            finalChars[i] = base64Bytes[i] switch
            {
                SlashByte => Hyphen,
                PlusByte => Underscore,
                _ => (char)base64Bytes[i]
            };

        return new string(finalChars);
    }
}