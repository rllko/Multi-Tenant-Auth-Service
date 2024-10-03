
using HeadHunter.Services.ClientComponents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

[Authorize(Policy = "Special")]
public class OffsetsEndpoint
{

    public static async Task<IResult> HandleGet(HttpContext context, ISoftwareComponents softwareComponents)
    {
        if(!context.Request.Query.TryGetValue("discordId", out var License))
        {
            return Results.BadRequest(new { Error = "Invalid Discord Id" });
        }

        var offsets = await softwareComponents.GetOffsets();

        if(offsets is null)
        {
            return Results.BadRequest(new { Error = "Invalid Offset file" });
        }

        return Results.Json(offsets);
    }

    [HttpPost]
    public static async Task<IResult> HandlePost(HttpContext context, ISoftwareComponents softwareComponents)
    {
        if(context.Request.Form.TryGetValue("offsets", out var Offsets) is false)
        {
            return Results.NotFound();
        }

        try
        {
            var offsetsJson = JsonConvert.SerializeObject(Offsets.ToString());

            if(await softwareComponents.SetOffsets(offsetsJson) is false)
            {
                return Results.BadRequest(new { Error = "There was an error saving offsets" });
            }

            return Results.Ok();

        }
        catch(JsonException e)
        {
            return Results.BadRequest(new { e.Message });
        }
    }
}