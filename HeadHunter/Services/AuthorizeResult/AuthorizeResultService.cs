using HeadHunter.Common;
using HeadHunter.Models;
using HeadHunter.Models.Context;
using HeadHunter.OauthRequest;
using HeadHunter.OauthResponse;
using HeadHunter.Services.CodeService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Web;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

namespace HeadHunter.Services.Interfaces
{
    public class AuthorizeResultService : IAuthorizeResultService
    {
        private readonly InMemoryClientDatabase _clientStore = new();
        private readonly ICodeStorageService _codeStoreService;
        private readonly IAcessTokenStorageService _acessTokenStorageService;
        private readonly DevKeys _devKeys;

        // gotta change this to a RSA later!!!!
        // to do ig

        public AuthorizeResultService(ICodeStorageService codeStoreService,
            IAcessTokenStorageService acessTokenStorageService,
            DevKeys devKeys
            )
        {
            _codeStoreService = codeStoreService;
            _acessTokenStorageService = acessTokenStorageService;
            _devKeys = devKeys;
        }

        public AuthorizeResponse AuthorizeRequest(ref HttpContext httpContext, AuthorizationRequest authorizationRequest)
        {
            AuthorizeResponse response = new();

            var client = VerifyClientById(clientId:authorizationRequest.client_id);

            #region Domain Checking

            if(client.IsSuccess is false)
            {
                response.Error = client.ErrorDescription;
                return response;
            }

            if(string.IsNullOrEmpty(authorizationRequest.response_type) ||
                authorizationRequest.response_type != "code")
            {
                response.Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription();
                response.ErrorDescription = "response type is required or is not valid";
                return response;
            }

            if(!authorizationRequest.redirect_uri.IsRedirectUriStartWithHttps() &&
               !httpContext.Request.IsHttps)
            {
                response.Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription();
                response.ErrorDescription = "redirect url is not secure, MUST be TLS";
                return response;
            }

            if(string.IsNullOrWhiteSpace(authorizationRequest.code_challenge))
            {
                response.Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription();
                response.ErrorDescription = "code challenge required";
                return response;
            }

            // check the return url is match the one that in the client store
            bool redirectUriIsMatched = client.Client.Redirecturi!.Equals(authorizationRequest.redirect_uri, StringComparison.OrdinalIgnoreCase);
            if(!redirectUriIsMatched)
            {
                response.Error = ErrorTypeEnum.InvalidRequest.GetEnumDescription();
                response.ErrorDescription = "redirect uri is not matched the one in the client store";
                return response;
            }

            // check the scope in the client store with the
            // one that is comming from the request MUST be matched at leaset one

            #endregion

            var scopes = authorizationRequest.scope.Split(' ');

            if(scopes.Length == 0)
            {
                //response.Error = ErrorTypeEnum.InValidScope.GetEnumDescription();
                //response.ErrorDescription = "scopes are invalids";
                //return response;
                scopes = new string [] { "default" };
            }

            var clientScopes = client.Client.Allowedscopes.Where(x => scopes.Contains(x)).AsQueryable();

            var authoCode = new AuthorizationCode
            {
                ClientId = authorizationRequest.client_id,
                RedirectUri = authorizationRequest.redirect_uri,
                RequestedScopes = [.. clientScopes],
                IsOpenId = clientScopes.Contains("openid"),
                CodeChallenge = authorizationRequest.code_challenge,
                CodeChallengeMethod = authorizationRequest.code_challenge_method,
                CreationTime = DateTime.UtcNow,
            };

            string? code = _codeStoreService.GenerateCode(authorizationRequest.client_id, authoCode);
            if(code == null)
            {
                response.Error = ErrorTypeEnum.TemporarilyUnAvailable.GetEnumDescription();
                return response;
            }

            response.RedirectUri = client.Client.Redirecturi
                + "?code=" + code
                + "&state=" + httpContext.Request.Query ["state"]
                + "&iss=" + response.Issuer;
            response.Code = code;
            response.State = authorizationRequest.state;
            response.RequestedScopes = [.. clientScopes];

            return response;
        }



        public async Task<TokenResponse> GenerateTokenAsync(HttpContext httpContext, [FromServices] DevKeys devKeys)
        {
            var httpRequest = httpContext.Request;

            httpRequest.EnableBuffering();

            var bodyBytes = httpRequest.BodyReader.ReadAsync();
            await bodyBytes;

            var bodyContent = Encoding.UTF8.GetString(bodyBytes.Result.Buffer);
            var query = HttpUtility.ParseQueryString(bodyContent);

            var request = new TokenRequest
            {
                ClientId = query["client_id"]!,
                ClientSecret = query["client_secret"]!,
                Code = query["code"]!,
                GrantType = query["grant_type"]!,
                RedirectUri = query["redirect_uri"]
            };

            var checkClientResult = VerifyClientById(request.ClientId, true, request.ClientSecret);
            if(!checkClientResult.IsSuccess)
            {
                return new TokenResponse { Error = checkClientResult.Error, ErrorDescription = checkClientResult.ErrorDescription };
            }

            // check code from the Concurrent Dictionary
            var clientCodeChecker = _codeStoreService.GetClientByCode(request.Code);
            if(clientCodeChecker == null)
                return new TokenResponse { Error = ErrorTypeEnum.InvalidGrant.GetEnumDescription() };

            // check if the current client who is one made this authentication request

            if(request.ClientId != clientCodeChecker.ClientId)
                return new TokenResponse { Error = ErrorTypeEnum.InvalidGrant.GetEnumDescription() };

            // TODO: 
            // also I have to check the rediret uri 

            // Now here I will Issue the Id_token
            var handler = new JsonWebTokenHandler();

            string? id_token = null;
            if(clientCodeChecker.IsOpenId)
            {
                // TO DO :D
                // Generate Identity Token

                var key = new RsaSecurityKey(devKeys.RsaKey);
                id_token = handler.CreateToken(new SecurityTokenDescriptor()
                {
                    Claims = new Dictionary<string, object>()
                    {
                        [JwtRegisteredClaimNames.Sub] = "nigger",
                        [JwtRegisteredClaimNames.Aud] = request.ClientId,
                        [JwtRegisteredClaimNames.Iss] = "https://localhost:5069",
                        [JwtRegisteredClaimNames.Nonce] = clientCodeChecker.Nonce,
                        [JwtRegisteredClaimNames.Nickname] = "MY NIGGERRRRR",
                    },
                    Expires = DateTime.Now.AddMinutes(15),
                    IssuedAt = DateTime.Now,
                    TokenType = "Bearer",
                    SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.RsaSha256)
                });

            }
            //var access_token = handler.CreateToken(new SecurityTokenDescriptor()
            //{
            //    Claims = new Dictionary<string, object>()
            //    {
            //        [JwtRegisteredClaimNames.Iss] = "https://localhost:5069",
            //        [JwtRegisteredClaimNames.Nonce] = clientCodeChecker.Nonce,

            //    },
            //    Expires = DateTime.Now.AddMinutes(2),
            //    IssuedAt = DateTime.Now,
            //    TokenType = "Bearer",
            //    SigningCredentials = credentials_at,
            //});

            var access_token = _acessTokenStorageService.Generate(request.Code);

            // here remoce the code from the Concurrent Dictionary
            _codeStoreService.RemoveClientByCode(request.Code);

            var tokenResponse = new TokenResponse
            {
                requested_scopes = string.Join(" ", clientCodeChecker.RequestedScopes),
                access_token = access_token ?? null,
                id_token = id_token ?? null,
                code = request.Code,
            };

            return tokenResponse;
        }

        private CheckClientResult VerifyClientById(string clientId, bool checkWithSecret = false, string clientSecret = null)
        {
            var result = new CheckClientResult();

            if(string.IsNullOrWhiteSpace(clientId))
            {
                result.Error = ErrorTypeEnum.InvalidClient.GetEnumDescription();
                return result;
            }

            // check if client exists
            var storedClient = _clientStore.Clients
                    .Where(x => x.Clientid.Equals(clientId, StringComparison.OrdinalIgnoreCase)).FirstOrDefault();

            if(storedClient == null)
            {
                result.Error = ErrorTypeEnum.AccessDenied.GetEnumDescription();
                return result;
            }

            if(checkWithSecret && !string.IsNullOrEmpty(clientSecret))
            {
                bool hasSamesecretId =
                    storedClient.Clientsecret.Equals(clientSecret, StringComparison.Ordinal);
                if(!hasSamesecretId)
                {
                    result.Error = ErrorTypeEnum.InvalidClient.GetEnumDescription();
                    return result;
                }
            }

            //// check if client is enabled or not

            result.IsSuccess = true;
            result.Client = storedClient;

            return result;
        }
    }
}
