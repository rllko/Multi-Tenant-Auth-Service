namespace Authentication.Services.Logging.Enums;

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
    InviteDeclined,
    InviteRevoked,
    SettingsChanged,
    MessageSent,
    TeamJoined,
    TeamLeft,
    MemberRemoved,
    RoleCreated,
    RoleUpdated,
    ApplicationCreated,
    ApplicationUpdated,
    ApplicationDeleted
}