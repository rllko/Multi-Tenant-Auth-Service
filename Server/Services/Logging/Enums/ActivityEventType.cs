namespace Authentication.Logging.Enums;

public enum ActivityEventType
{
    UserRegistered,
    ProfileUpdated,
    PasswordResetRequested,
    ProjectCreated,
    ProjectUpdated,
    ProjectDeleted,
    FileUploaded,
    FileDownloaded,
    UserInvited,
    InviteAccepted,
    SettingsChanged,
    MessageSent,
    TeamJoined,
    TeamLeft
}