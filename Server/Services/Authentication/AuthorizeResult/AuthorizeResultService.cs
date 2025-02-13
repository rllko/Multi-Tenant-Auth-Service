using Authentication.Common;
using Authentication.Controllers.Authorization;
using Authentication.Controllers.Token;
using Authentication.Models;
using Authentication.Models.Entities.OAuth;
using Authentication.OauthResponse;
using Authentication.Services.Authentication.CodeStorage;
using Authentication.Services.CodeService;
using Authentication.Validators;
using FluentValidation;
using FluentValidation.Results;

namespace Authentication.Services.Authentication.AuthorizeResult;

public class AuthorizeResultService(
    IValidator<AuthorizeRequest> validator,
    IValidator<TokenRequest> tokenRequestValidator,
    ICodeStorageService codeStoreService,
    IAcessTokenStorageService acessTokenStorageService,
    IClientService clientService,
    DevKeys devKeys
) : IAuthorizeResultService
{
    // used to generate token
    private readonly IAcessTokenStorageService _acessTokenStorageService = acessTokenStorageService;
    private readonly ICodeStorageService _codeStoreService = codeStoreService;

    public async Task<Result<AuthorizeResponse, ValidationFailed>> AuthorizeRequestAsync(HttpContext httpContext,
        AuthorizeRequest authorizeRequest)
    {
        var validationResult = await validator.ValidateAsync(authorizeRequest);
        if (!validationResult.IsValid)
            return new ValidationFailed(validationResult.Errors);

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
            ClientIdentifier = clientResult.ClientIdentifier,
            CodeChallenge = authorizeRequest.CodeChallenge,
            CodeChallengeMethod = authorizeRequest.CodeChallengeMethod
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
            Code = code,
            Issuer = "rikko",
            State = authorizeRequest.State
        };
    }

    public async Task<Result<TokenResponse, ValidationFailed>> GenerateToken(TokenRequest tokenRequest)
    {
        var validationResult = await tokenRequestValidator.ValidateAsync(tokenRequest);
        if (!validationResult.IsValid)
            return new ValidationFailed(validationResult.Errors);

        // add validator here
        // check code from the Concurrent Dictionary
        var clientCodeChecker = _codeStoreService.GetClientByCode(tokenRequest.code.ToString());
        if (clientCodeChecker == null)
        {
            var error = new ValidationFailure(
                ErrorTypeEnum.InvalidClient.GetEnumDescription(),
                "Invalid client");
            return new ValidationFailed(error);
        }

        var accessToken = _acessTokenStorageService.Generate(tokenRequest.code!);

        var tokenResponse = new TokenResponse
        {
            AccessToken = accessToken ?? null
        };

        return tokenResponse;
    }

    private async Task<Client?> VerifyClientById(string clientIdentifier,
        bool checkWithSecret = false,
        string? clientSecret = null)
    {
        // check if client exists
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