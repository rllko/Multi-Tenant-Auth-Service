namespace DiscordTemplate.OAuth
{
    public abstract class IProtectedEndpoint
    {
        public string? ExceptionMessage { set; get; }
        public string? StackTrace { set; get; }

        public bool Succeed => ExceptionMessage is null && StackTrace is null;
    }
}
