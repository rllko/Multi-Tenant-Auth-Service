
using HeadHunter.Services.ClientComponents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


public class OffsetsEndpoint
{

    public static async Task<IResult> HandleGet(HttpContext context, ISoftwareComponents softwareComponents)
    {
        if(!context.Request.Query.TryGetValue("file", out var filename))
        {
            return Results.NotFound();
        }

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

        var stream = new FileStream(path, FileMode.Open);
        return Results.File(stream, "APPLICATION/octet-stream", filename);
    }

    [HttpPost]
    [Authorize(Policy = "Special")]
    public static async Task<IResult> HandlePost(HttpContext context, ISoftwareComponents softwareComponents)
    {
        if(!context.Request.Form.TryGetValue("url", out var Url) ||
            !context.Request.Form.TryGetValue("filename", out var FileName))
        {
            return Results.NotFound();
        }

        var path = Path.Combine(Directory.GetCurrentDirectory(),"Files", $"{FileName.ToString()}");

        var offsets = await softwareComponents.GetOffsets(Url.ToString());

        if(offsets is null)
        {
            return Results.BadRequest(new { Error = "Something went wrong on downloading :shrug:" });
        }

        // Create a new local file and copy contents of the uploaded file
        using var localFile = System.IO.File.Create(path);
        offsets.CopyTo(localFile);

        return Results.Ok();
    }
}