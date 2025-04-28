namespace Authentication.Logging.Enums;

public enum AuthEventType
{
    LoginSuccess,
    LoginFailed,
    TokenIssued,
    TokenRefreshed,
    TokenRevoked,
    Logout,
}