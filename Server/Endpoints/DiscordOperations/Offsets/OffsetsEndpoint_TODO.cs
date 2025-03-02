using Authentication.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using NSec.Cryptography;

namespace Authentication.Endpoints.DiscordOperations.Offsets;

[Authorize]
public class OffsetsEndpoint_TODO
{
    public static async Task<IResult> HandleGet(
        HttpContext context,
        string filename)
    {
        var response = new DiscordResponse<string>();

        if (string.IsNullOrEmpty(filename)) return Results.NotFound();

        if (context.Items["user"] is not UserSession loggedUser)
        {
            response.Error = "Something went wrong.";
            return Results.Json(response);
        }

        var path = Path.Combine(Directory.GetCurrentDirectory(), "Files", filename);

        if (path.StartsWith(Directory.GetCurrentDirectory()) is false)
        {
            response.Error = "Invalid directory path";
            return Results.Json(response);
        }

        if (File.Exists(path) is false)
        {
            response.Error = "File not found";
            return Results.Json(response);
        }

        // if (loggedUser.License.Hw is { Bios: null, Cpu: null })
        // {
        //     response.Error = "There isnt an hwid associated to this user.";
        //     return Results.Json(response);
        // }

        //var firstChunk = Encoding.ASCII.GetBytes(loggedUser!.Hw!.Bios!).Chunk(6).First();
        //var secondChunk = Encoding.ASCII.GetBytes(loggedUser!.Hw!.Cpu!).Chunk(6).First();

        //var nonce = firstChunk.Concat(secondChunk).ToArray();
        var aad = new byte[0];
        var data = await File.ReadAllBytesAsync(path);

        var alg = AeadAlgorithm.ChaCha20Poly1305;

        // sign the data using the private key
        // var signature = alg.Encrypt(key, nonce, aad, data);

        // return Results.File(signature, fileDownloadName: filename);
        return Results.Ok();
    }
}