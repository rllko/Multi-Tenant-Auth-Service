using Authentication.Services.ActivityLogger;
using Authentication.Services.ClientComponents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Authentication.Endpoints.ProtectedResources.DiscordOperations;

public class DiscordOffsetEndpoint
{
    [Authorize(Policy = "Special")]
    public static async Task<IResult> HandleGet(HttpContext context, IActivityLogger logger, string filename)
    {
        var response = new DiscordResponse<string>();

        if (string.IsNullOrEmpty(filename)) return Results.NotFound();

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

        var stream = await File.ReadAllBytesAsync(path);
        response.Result = Convert.ToBase64String(stream);

        return Results.Json(response);
    }

    [HttpPost]
    [Authorize(Policy = "Special")]
    public static async Task<IResult> HandlePost(
        HttpContext context,
        IOffsetService offsetService,
        IActivityLogger logger)
    {
        var form = context.Request.Form;
        var response = new DiscordResponse<bool>();

        if (form.TryGetValue("url", out var url) is false ||
            form.TryGetValue("filename", out var fileName) is false ||
            form.TryGetValue("discordId", out var discordId) is false)
        {
            response.Error = "not enough parameters.";
            return Results.Json(response);
        }

        var path = Path.Combine(Directory.GetCurrentDirectory(), "Files", $"{fileName}");

        var offsets = await offsetService.GetOffsets(url.ToString());

        if (offsets is null)
        {
            response.Result = false;
            response.Error = "Something went wrong on downloading :shrug:";
            return Results.Json(response);
        }

        var id = long.Parse(discordId!);

        await logger.LogActivityAsync(ActivityType.FileUpload,
            $" {context.Request.Headers["cf-connecting-ip"]!} and id {id}");

        // Create a new local file and copy contents of the uploaded file
        await using var localFile = File.Create(path);
        await offsets.CopyToAsync(localFile);

        response.Result = true;
        return Results.Json(response);
    }
}