using HeadHunter.Models.Entities;
using HeadHunter.Services.ActivityLogger;
using HeadHunter.Services.ClientComponents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeadHunter.Endpoints;

[Authorize]
public class OffsetsEndpoint
{

    public static async Task<IResult> HandleGet(HttpContext context, IActivityLogger logger, string filename)
    {
        if(string.IsNullOrEmpty(filename))
        {
            return Results.NotFound();
        }

        var path = Path.Combine(Directory.GetCurrentDirectory(),"Files", filename.ToString());

        if(path.StartsWith(Directory.GetCurrentDirectory()) is false)
        {
            return Results.NotFound();
        }

        if(System.IO.File.Exists(path) is false)
        {
            return Results.NotFound();
        }

        if(context.Items ["user"] is not User loggedUser)
        {
            return Results.NotFound();
        }
        
        await logger.LogActivityAsync(loggedUser.Id, ActivityType.Login, context.Request.Headers ["cf-connecting-ip"]!);
        var stream = new FileStream(path, FileMode.Open);
        return Results.File(stream, "APPLICATION/octet-stream", filename);
    }

    [HttpPost]
    [Authorize(Policy = "Special")]
    public static async Task<IResult> HandlePost(HttpContext context, ISoftwareComponents softwareComponents)
    {
        if(!context.Request.Form.TryGetValue("url", out var url) ||
            !context.Request.Form.TryGetValue("filename", value: out var fileName))
        {
            return Results.NotFound();
        }

        var path = Path.Combine(Directory.GetCurrentDirectory(),"Files", $"{fileName}");

        var offsets = await softwareComponents.GetOffsets(url.ToString());

        if(offsets is null)
        {
            return Results.BadRequest(new DiscordResponse<bool>() { Result = false, Error = "Something went wrong on downloading :shrug:" });
        }

        // Create a new local file and copy contents of the uploaded file
        await using var localFile = System.IO.File.Create(path);
        await offsets.CopyToAsync(localFile);

        return Results.Ok(new DiscordResponse<bool>() { Result = true });
    }
}