namespace Authentication.Endpoints;

public class DiscordResponse<T>
{
    public T? Result { get; set; }
    public string Error { get; set; } = "none";
}