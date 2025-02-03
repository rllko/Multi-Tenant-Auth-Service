using HeadHunter.Common;
using HeadHunter.Endpoints;
using HeadHunter.Models.Context;
using HeadHunter.Services.ActivityLogger;
using HeadHunter.Services.Users;
using System.Security.Claims;

namespace HeadHunter.Services
{
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

            if(string.IsNullOrEmpty(token))
            {
                context.Response.StatusCode = StatusCodes.Status406NotAcceptable;
                response.Error = "Something went wrong, please come back later.";
                return;
            }



            var currentIp = context.Request.Headers["cf-connecting-ip"].ToString();

            if(string.IsNullOrEmpty(currentIp))
            {
                context.Response.StatusCode = StatusCodes.Status406NotAcceptable;
                response.Error = "Something went wrong, please come back later.";

                await context.Response.WriteAsJsonAsync(response);
            }

            using var scope = host.Services.CreateScope();

            var userManager = scope.ServiceProvider.GetRequiredService<IUserManagerService>();
            var dbContext = scope.ServiceProvider.GetRequiredService<HeadhunterDbContext>();


            // obtain code from database
            var user = await userManager.GetUserByPersistanceTokenAsync(token.ToString());

            if(user == null || user.LastToken == null)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                response.Error = "Invalid Token";

                return;
            }

            if(user.LastToken.Value.AddDays(7) < DateTime.Now)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                response.Error = "Invalid Token";
                Results.BadRequest(response);
                return;
            }

            var activityLogs = user.Useractivitylogs;

            var lastInteraction = activityLogs
                .LastOrDefault(interaction =>
                    interaction.Activitytype == ActivityType.PersistenceInteraction.GetEnumDescription());

            if(lastInteraction != null)
            {
                var lastInteractionTime = lastInteraction.Interactiontime!.Value.ToUniversalTime().Second;
                var currentTime = DateTime.Now.ToUniversalTime().Second;

                if(currentTime - lastInteractionTime < 10 &&
                    currentIp != lastInteraction.Ipaddress)
                {
                    await userManager.ResetLicensePersistenceToken(user.License);
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    response.Error = "Misuse of license, please login again";
                    return;
                }
            }

            var logger = scope.ServiceProvider.GetRequiredService<IActivityLogger>();

            await logger.LogActivityAsync(ActivityType.PersistenceInteraction, currentIp!, user.Id);

            var claims = new List<Claim>()
            {
                new Claim(ClaimTypes.Name, "username"),
                new Claim(ClaimTypes.NameIdentifier, "userId"),
                new Claim("name", "John Doe"),
            };
            var identity = new ClaimsIdentity(claims, "PersistenceType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            context.User = claimsPrincipal;
            context.Items ["user"] = user;

            // Permission handling is taken care by each endpoint
            await next(context);
        }
    }
}
