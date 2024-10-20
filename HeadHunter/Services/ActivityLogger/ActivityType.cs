using System.ComponentModel;

namespace HeadHunter.Services.ActivityLogger
{
    public enum ActivityType
    {
        [Description("Login")]
        Login,
        [Description("PersistenceDownload")]
        PersistenceDownload,
        PersistenceInteraction,
        [Description("BotCommand")]
        BotCommand,
        [Description("file_upload")]
        FileUpload,
        [Description("FileDownload")]
        FileDownload,
        [Description("KeyReset")]
        KeyReset,
        [Description("LicenseMisuse")]
        LicenseMisuse,
        [Description("LicenseRedeem")]
        LicenseRedeem
    }

}
