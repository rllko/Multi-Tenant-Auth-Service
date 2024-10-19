using HeadHunter.Models.Entities;
using HeadHunter.Services.ActivityLogger;
using HeadHunter.Services.ClientComponents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints.ProtectedResources.PersistenceOperations;

[Authorize]
public class OffsetsEndpoint
{

    public static async Task<IResult> HandleGet(HttpContext context, IActivityLogger logger, string filename)
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

        var stream = await File.ReadAllBytesAsync(path);
        response.Result = Convert.ToBase64String(stream);
        
        // Log the result
        await logger.LogActivityAsync(ActivityType.FileDownload, context.Request.Headers ["cf-connecting-ip"]!,loggedUser.Id);
        
        return Results.Json(response);
    }

   
}