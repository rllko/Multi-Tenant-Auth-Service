using System.IdentityModel.Tokens.Jwt;
using Authentication.Common;
using Authentication.Models;
using Authentication.Models.Entities.OAuth;
using Authentication.OauthRequest;
using Authentication.OauthResponse;
using Authentication.Services.CodeService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

namespace Authentication.Services.Interfaces;

public class AuthorizeResultService(
    ICodeStorageService codeStoreService,
    IAcessTokenStorageService acessTokenStorageService
) : IAuthorizeResultService
{
    private readonly IAcessTokenStorageService _acessTokenStorageService = acessTokenStorageService;

    //private readonly InMemoryClientDatabase _clientStore = new();
    private readonly ICodeStorageService _codeStoreService = codeStoreService;

    public AuthorizeResponse AuthorizeRequest(HttpContext httpContext, AuthorizationRequest authorizationRequest)
    {
        AuthorizeResponse response = new();

        var clientResult = VerifyClientById(authorizationRequest.client_id);

        #region Domain Checking

        if (clientResult.IsSuccess is false)
        {
            response.Error = clientResult.ErrorDescription!;
            return response;
        }

        if (clientResult.Client!.Scopes.Count == 0)
        {
            response.Error = ErrorTypeEnum.InvalidClient.GetEnumDescription();
            response.ErrorDescription = "client has no scopes";
            return response;
        }

        if (string.IsNullOrEmpty(authorizationRequest.response_type) ||
            authorizationRequest.response_type != "code")
        {
            response.Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription();
            response.ErrorDescription = "response type is required or is not valid";
            return response;
        }

        //if(!authorizationRequest.RedirectUrl.IsRedirectUriStartWithHttps() &&
        //   !httpContext.Request.IsHttps)
        //{
        //    response.Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription();
        //    response.ErrorDescription = "redirect url is not secure, MUST be TLS";
        //    return response;
        //}

        if (string.IsNullOrWhiteSpace(authorizationRequest.code_challenge))
        {
            response.Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription();
            response.ErrorDescription = "code challenge required";
            return response;
        }


        // check the Scope in the client store with the
        // one that is comming from the request MUST be matched at leaset one

        #endregion

        var scopes = authorizationRequest.scope!.Split(' ');

        if (scopes.Length == 0)
            //response.Error = ErrorTypeEnum.InValidScope.GetEnumDescription();
            //response.ErrorDescription = "scopes are invalids";
            //return response;
            scopes = ["default"];

        var clientScopes = scopes.Intersect(clientResult.Client.Scopes.Select(s => s.ScopeName));

        var authoCode = new AuthorizationCode
        {
            ClientIdentifier = authorizationRequest.client_id,
            RequestedScopes = [.. clientScopes],
            IsOpenId = clientScopes.Contains("openid"),
            CodeChallenge = authorizationRequest.code_challenge,
            CodeChallengeMethod = authorizationRequest.code_challenge_method,
            CreationTime = DateTime.UtcNow,

            Subject = clientResult.Client.ClientIdentifier!
        };

        // // var code = _codeStoreService.CreateAuthorizationCode(_dbContext, authorizationRequest.client_id, authoCode);
        // if (code == null)
        // {
        //     response.Error = ErrorTypeEnum.TemporarilyUnAvailable.GetEnumDescription();
        //     return response;
        // }


        // response.Code = code;
        response.ResponseType = authorizationRequest.response_type;
        response.State = authorizationRequest.state;
        response.RequestedScopes = [.. clientScopes];

        return response;
    }


    public TokenResponse GenerateToken(HttpContext httpContext, [FromServices] DevKeys devKeys)
    {
        var form = httpContext.Request.Form;

        var request = new TokenRequest
        {
            ClientId = form["client_id"]!,
            ClientSecret = form["client_secret"]!,
            Code = form["code"]!,
            GrantType = form["grant_type"]!
        };

        var checkClientResult = VerifyClientById(request.ClientId, true, request.ClientSecret);
        if (!checkClientResult.IsSuccess)
            return new TokenResponse
                { Error = checkClientResult.Error!, ErrorDescription = checkClientResult.ErrorDescription! };

        // check code from the Concurrent Dictionary
        var clientCodeChecker = _codeStoreService.GetClientByCode(request.Code);
        if (clientCodeChecker == null)
            return new TokenResponse { Error = ErrorTypeEnum.InvalidClient.GetEnumDescription() };

        // check if the current client who is one made this authentication request

        if (request.ClientId != clientCodeChecker.ClientIdentifier)
            return new TokenResponse { Error = ErrorTypeEnum.InvalidClient.GetEnumDescription() };


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
                    [JwtRegisteredClaimNames.Sub] = request.ClientId,
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


    private CheckClientResult VerifyClientById(string? clientIdentifier, bool checkWithSecret = false,
        string? clientSecret = null)
    {
        var result = new CheckClientResult();

        if (string.IsNullOrWhiteSpace(clientIdentifier))
        {
            result.Error = ErrorTypeEnum.InvalidClient.GetEnumDescription();
            return result;
        }

        Client storedClient;

        try
        {
            // check if client exists
            // storedClient = _dbContext.Clients.Include(x => x.Scopes)
            // .First(x => x.ClientIdentifier!.Equals(clientIdentifier));
        }
        catch (Exception)
        {
            result.Error = ErrorTypeEnum.AccessDenied.GetEnumDescription();
            return result;
        }

        /*
        if (storedClient == null)
        {
            result.Error = ErrorTypeEnum.AccessDenied.GetEnumDescription();
            return result;
        }


        if (checkWithSecret && !string.IsNullOrEmpty(clientSecret))
        {
            var hasSamesecretId =
                storedClient.ClientSecret!.Equals(clientSecret, StringComparison.Ordinal);
            if (!hasSamesecretId)
            {
                result.Error = ErrorTypeEnum.InvalidClient.GetEnumDescription();
                return result;
            }
        }

        //// check if client is enabled or not

        result.IsSuccess = true;
        result.Client = storedClient;
        */

        return result;
    }
}