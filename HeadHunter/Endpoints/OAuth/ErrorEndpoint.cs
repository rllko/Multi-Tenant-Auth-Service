namespace HeadHunter.Endpoints.OAuth;

public static class ErrorEndpoint
{
    public static async Task Handler(HttpResponse httpResponse)
    {
        httpResponse.Headers.ContentType = new string [] { "text/html" };
        await httpResponse.WriteAsJsonAsync(
            $"""
            Some error happened! Please fix this later bruv
            """);
    }
}