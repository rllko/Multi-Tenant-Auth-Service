using Authentication.Endpoints;

// using Authentication.Models.Context;

namespace Authentication.Services;

public class PersistenceMiddleware(RequestDelegate next, IHost host)
{
    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            context.Response.Headers.Remove("Server");
            return Task.CompletedTask;
        });

        var response = new DiscordResponse<string>();
        var token = context.Request.Headers["Sec-Ch-Ptk"];

        if (string.IsNullOrEmpty(token))
        {
            context.Response.StatusCode = StatusCodes.Status406NotAcceptable;
            response.Error = "Something went wrong, please come back later.";
            return;
        }


        var currentIp = context.Request.Headers["cf-connecting-ip"].ToString();

        if (string.IsNullOrEmpty(currentIp))
        {
            context.Response.StatusCode = StatusCodes.Status406NotAcceptable;
            response.Error = "Something went wrong, please come back later.";

            await context.Response.WriteAsJsonAsync(response);
        }

        using var scope = host.Services.CreateScope();

        // var userManager = scope.ServiceProvider.GetRequiredService<ILicenseManagerService>();
        // var dbContext = scope.ServiceProvider.GetRequiredService<AuthenticationDbContext>();


        // obtain code from database
        // var user = await userManager.GetUserByPersistanceTokenAsync(token.ToString());

        // if (user == null || user.lasttoken == null)
        // {
        //     context.response.statuscode = statuscodes.status403forbidden;
        //     response.error = "invalid token";
        //
        //     return;
        // }
        //
        // if (user.lasttoken.value.adddays(7) < datetime.now)
        // {
        //     context.response.statuscode = statuscodes.status403forbidden;
        //     response.error = "invalid token";
        //     results.badrequest(response);
        //     return;
        // }
        //
        // var activitylogs = user.useractivitylogs;
        //
        // var lastinteraction = activitylogs
        //     .lastordefault(interaction =>
        //         interaction.activitytype == activitytype.persistenceinteraction.getenumdescription());
        //
        // if (lastinteraction != null)
        // {
        //     var lastinteractiontime = lastinteraction.interactiontime!.value.touniversaltime().second;
        //     var currenttime = datetime.now.touniversaltime().second;
        //
        //     if (currenttime - lastinteractiontime < 10 &&
        //         currentip != lastinteraction.ipaddress)
        //     {
        //         await usermanager.resetlicensepersistencetoken(user.license);
        //         context.response.statuscode = statuscodes.status403forbidden;
        //         response.error = "misuse of license, please login again";
        //         return;
        //     }
        // }
        //
        // var logger = scope.ServiceProvider.GetRequiredService<IActivityLogger>();
        //
        // await logger.LogActivityAsync(ActivityType.PersistenceInteraction, currentIp!, user.Id);
        //
        // var claims = new List<Claim>
        // {
        //     new(ClaimTypes.Name, "username"),
        //     new(ClaimTypes.NameIdentifier, "userId"),
        //     new("name", "John Doe")
        // };
        // var identity = new ClaimsIdentity(claims, "PersistenceType");
        // var claimsPrincipal = new ClaimsPrincipal(identity);
        //
        // context.User = claimsPrincipal;
        // // context.Items["user"] = user;
        //
        // // Permission handling is taken care by each endpoint
        // await next(context);
    }
}