using System.Text;
using HeadHunter.Models.Entities;
using HeadHunter.Services;
using HeadHunter.Services.ActivityLogger;
using HeadHunter.Services.ClientComponents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NSec.Cryptography;

namespace HeadHunter.Endpoints.ProtectedResources.PersistenceOperations;

[Authorize]
public class OffsetsEndpoint
{

    public static async Task<IResult> HandleGet(
        HttpContext context, IActivityLogger logger,
        DevKeys devKeys, string filename)
    {
        var response = new DiscordResponse<string>();
        
        if(string.IsNullOrEmpty(filename))  
        {
            return Results.NotFound();
        }

        if(context.Items ["user"] is not User loggedUser)
        {
            response.Error = "Something went wrong.";
            return Results.Json(response);
        }
        
        var path = Path.Combine(Directory.GetCurrentDirectory(),"Files", filename.ToString());

        if(path.StartsWith(Directory.GetCurrentDirectory()) is false)
        {
            response.Error = "Invalid directory path";
            return Results.Json(response);
        }

        if(System.IO.File.Exists(path) is false)
        {
            response.Error = "File not found";
            return Results.Json(response);
        }

        if (loggedUser.Hw is { Bios: null, Cpu: null })
        {
            response.Error = "There isnt an hwid associated to this user.";
            return Results.Json(response);
        }
        
        var firstChunk = Encoding.ASCII.GetBytes(loggedUser!.Hw!.Bios!).Chunk(6).First();
        var secondChunk = Encoding.ASCII.GetBytes(loggedUser!.Hw!.Cpu!).Chunk(6).First();
        
        var nonce = firstChunk.Concat(secondChunk).ToArray();
        byte[] aad = new byte[0];
        var data = await File.ReadAllBytesAsync(path);
        
        var alg = AeadAlgorithm.ChaCha20Poly1305;
        var key = devKeys.ChaChaKey;
        
        // sign the data using the private key
        var signature = alg.Encrypt(key,nonce,aad,data);
        
        await logger.LogActivityAsync(ActivityType.FileDownload, context.Request.Headers ["cf-connecting-ip"]!,loggedUser.Id);
        
        return Results.File(signature,fileDownloadName:filename);
    }

   
}