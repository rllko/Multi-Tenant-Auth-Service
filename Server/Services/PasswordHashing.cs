using System.Security.Cryptography;

namespace Authentication.Services;

public static class PasswordHashing
{
    private static string GetRandomSalt()
    {
        return BCrypt.Net.BCrypt.GenerateSalt(13);
    }

    public static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, GetRandomSalt());
    }

    public static bool ValidatePassword(string password, string correctHash)
    {
        return BCrypt.Net.BCrypt.Verify(password, correctHash);
    }

    public static string GenerateRandomPassword(int size = 10)
    {
        var pw = Convert.ToBase64String(RandomNumberGenerator.GetBytes(size)).AsSpan();
        return pw.Slice(0, pw.Length - 2).ToString();
    }
}