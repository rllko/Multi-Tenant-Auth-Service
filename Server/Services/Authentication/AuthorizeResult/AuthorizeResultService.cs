using Authentication.Common;
using Authentication.Controllers.Authorization;
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

        var code = _codeStoreService.CreateAuthorizationCode(authoCode);

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

    /*
    public async Task<Result<TokenResponse?, ErrorTypeEnum?>> GenerateToken(
        TokenRequest tokenRequest
    )
    {
        // verify with the github, i dont know anymore
        checkClientResult.Match(
            r => { return r; },
            s => { return s; });
        if (checkClientResult.Item2 is not null)
            return checkClientResult.Item2;

        // check code from the Concurrent Dictionary
        var clientCodeChecker = _codeStoreService.GetClientByCode(request.Code!);
        if (clientCodeChecker == null)
            return ErrorTypeEnum.InvalidClient;

        // check if the current client who is one made this authentication request

        if (request.ClientId != clientCodeChecker.ClientIdentifier)
            return ErrorTypeEnum.InvalidClient;

        // Now here I will Issue the Id_token
        var handler = new JwtSecurityTokenHandler();

        string? id_token = null;
        if (clientCodeChecker.IsOpenId)
        {
            var key = new RsaSecurityKey(devKeys.RsaSignKey);
            var token = handler.CreateJwtSecurityToken(new SecurityTokenDescriptor
            {
                Claims = new Dictionary<string, object>
                {
                    [JwtRegisteredClaimNames.Sub] = request.ClientId!,
                    [JwtRegisteredClaimNames.Aud] = IdentityData.Audience,
                    [JwtRegisteredClaimNames.Iss] = IdentityData.Issuer,
                    [JwtRegisteredClaimNames.Iat] = DateTime.Now.Second,
                    ["Scope"] = clientCodeChecker.RequestedScopes,
                    [JwtRegisteredClaimNames.Exp] = DateTime.Now.AddMinutes(15) - DateTime.Now,
                    [JwtRegisteredClaimNames.Nickname] = clientCodeChecker.Subject
                },
                Expires = DateTime.Now.AddMinutes(15),
                IssuedAt = DateTime.Now,
                TokenType = "JWT",
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.RsaSha256)
            });

            id_token = handler.WriteToken(token);
        }

        var access_token = _acessTokenStorageService.Generate(Guid.Parse(request.Code));

        // here remove the code from the Concurrent Dictionary
        _codeStoreService.RemoveClientByCode(Guid.Parse(request.Code));

        var tokenResponse = new TokenResponse
        {
            RequestedScopes = string.Join(" ", clientCodeChecker.RequestedScopes),
            AccessToken = access_token ?? null,
            IdToken = id_token ?? null,
            Code = request.Code
        };

        return tokenResponse;
    }
    */

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