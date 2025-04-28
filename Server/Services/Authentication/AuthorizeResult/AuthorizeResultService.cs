using Authentication.Common;
using Authentication.Endpoints;
using Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;
using Authentication.Endpoints.Authorization;
using Authentication.Endpoints.Token;
using Authentication.Models;
using Authentication.OauthResponse;
using Authentication.Services.Authentication.CodeStorage;
using Authentication.Services.Authentication.OAuthAccessToken;
using Authentication.Services.Clients;
using FluentValidation;
using FluentValidation.Results;

namespace Authentication.Services.Authentication.AuthorizeResult;

public class AuthorizeResultService(
    IValidator<AuthorizeRequest> validator,
    IValidator<TokenRequest> tokenRequestValidator,
    ICodeService codeStoreService,
    IAccessTokenService accessTokenService,
    IClientService clientService
) : IAuthorizeResultService
{
    // used to generate token
    private readonly IAccessTokenService _accessTokenService = accessTokenService;
    private readonly ICodeService _codeStoreService = codeStoreService;

    public async Task<Result<AuthorizeResponse, ValidationFailed>> AuthorizeRequestAsync(HttpContext httpContext,
        AuthorizeRequest authorizeRequest)
    {
        var validationResult = await validator.ValidateAsync(authorizeRequest);
        if (!validationResult.IsValid)
            return new ValidationFailed(new ValidationFailure("error", "one or more fields empty"));

        var clientResult = await VerifyClientById(authorizeRequest.ClientId!);

        if (clientResult == null)
        {
            var error = new ValidationFailure(
                ErrorTypeEnum.InvalidClient.GetEnumDescription(),
                "Invalid client");
            return new ValidationFailed(error);
        }

        var authoCode = new AuthorizationCodeRequest
        {
            ClientId = clientResult.ClientIdentifier
        };

        var code = await _codeStoreService.CreateAuthorizationCodeAsync(authoCode);

        if (code == null)
        {
            var error = new ValidationFailure(
                ErrorTypeEnum.TemporarilyUnAvailable.GetEnumDescription(),
                "client identifier cannot be null or empty");
            return new ValidationFailed(error);
        }

        return new AuthorizeResponse
        {
            AccessToken = code,
            Issuer = "rikko",
            State = authorizeRequest.State
        };
    }

    public async Task<Result<TokenResponse, ValidationFailed>> GenerateToken(TokenRequest tokenRequest)
    {
        var validationResult = await tokenRequestValidator.ValidateAsync(tokenRequest);
        if (!validationResult.IsValid)
            return new ValidationFailed(validationResult.Errors);

        if (await _codeStoreService.GetClientCode(tokenRequest.code.ToString()) is null)
        {
            var error = new ValidationFailure(
                ErrorTypeEnum.InvalidClient.GetEnumDescription(),
                "Invalid client");
            return new ValidationFailed(error);
        }

        var tokenResponse = new TokenResponse
        {
            AccessToken = await _accessTokenService.Generate(tokenRequest.code!)
        };

        
        
        return tokenResponse;
    }

    private async Task<Client?> VerifyClientById(string clientIdentifier,
        bool checkWithSecret = false,
        string? clientSecret = null)
    {
        var storedClient = await clientService.GetClientByIdentifierAsync(clientIdentifier);

        if (storedClient == null) return null;

        if (checkWithSecret is true && string.IsNullOrEmpty(clientSecret))
        {
            var hasSameSecretId =
                storedClient.ClientSecret!.Equals(clientSecret, StringComparison.Ordinal);

            if (hasSameSecretId is false) return null;
        }

        return storedClient;
    }
}