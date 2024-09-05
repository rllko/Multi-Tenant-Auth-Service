namespace HeadHunter.Endpoints
{
    public static class ClientLoginEndpoint
    {
        public static IResult Handle(HttpContext httpContext)
        {
            var page = httpContext.Request.Query.TryGetValue("key",out var Key);

            if(string.IsNullOrEmpty(Key))
            {
                return Results.BadRequest("Key is null or empty.");
            }

            return Results.Ok();
        }
    }
}
