using System.ComponentModel;

namespace HeadHunter.Services.ActivityLogger
{
    public enum ActivityType
    {
        [Description("login")]
        Login,
        [Description("persistence_download")]
        PersistenceDownload,
        [Description("persistence_interaction")]
        PersistenceInteraction,
        [Description("bot_command")]
        BotCommand,
        [Description("file_upload")]
        FileUpload,
        [Description("file_download")]
        FileDownload,
        [Description("key_reset")]
        KeyReset,
        [Description("key_misused")]
        LicenseMisuse,
        [Description("license_redeem")]
        LicenseRedeem
    }

}
