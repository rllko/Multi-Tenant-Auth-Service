namespace Authentication.Services.Logging.Enums;

public enum AuthEventType
{
    LoginSuccess,
    LoginFailed,
    TokenIssued,
    TokenRefreshed,
    TokenRevoked,
    Logout
}