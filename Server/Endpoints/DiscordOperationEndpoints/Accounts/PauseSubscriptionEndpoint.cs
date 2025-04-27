namespace Authentication.Endpoints.DiscordOperations.Accounts;

public class PauseSubscriptionEndpoint
{
}

/*

UPDATE Licenses
   SET RemainingSeconds = RemainingSeconds - EXTRACT(EPOCH FROM (NOW() - LastStartedAt)),
       LastStartedAt = NULL,
       IsActive = FALSE
   WHERE LicenseId = 'your-license-id' AND IsActive = TRUE;

*/