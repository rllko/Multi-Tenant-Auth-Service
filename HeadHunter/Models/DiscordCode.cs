using HeadHunter.Models.Entities;

namespace HeadHunter.Models
{
    public class DiscordCode
    {
        public User User { get; init; }
        public DateTime CreationTime { get; init; } = DateTime.UtcNow;

        public bool isExpired => DateTime.UtcNow > CreationTime.AddMinutes(30);
    }
}
