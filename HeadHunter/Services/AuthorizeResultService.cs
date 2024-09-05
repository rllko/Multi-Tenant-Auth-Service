using HeadHunter.Common;
using HeadHunter.Models;
using HeadHunter.OauthRequest;
using HeadHunter.OauthResponse;
using HeadHunter.Services.CodeService;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

namespace HeadHunter.Services
{
    public class AuthorizeResultService : IAuthorizeResultService
    {
        private static readonly string keyAlg = "66007d41-6924-49f2-ac0c-e63c4b1a1730";
        private readonly ClientStore _clientStore = new();
        private readonly ICodeStoreService _codeStoreService;

        public AuthorizeResultService(ICodeStoreService codeStoreService) => _codeStoreService = codeStoreService;
        public AuthorizeResponse AuthorizeRequest(ref HttpContext httpContext, AuthorizationRequest authorizationRequest)
        {
            AuthorizeResponse response = new();

            var client = VerifyClientById(authorizationRequest.client_id);
            if(!client.IsSuccess)
            {
                response.Error = client.ErrorDescription;
                return response;
            }

            if(string.IsNullOrEmpty(authorizationRequest.response_type) || authorizationRequest.response_type != "code")
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

            var scopes = authorizationRequest.scope.Split(' ');

            var clientScopes = client.Client.Allowedscopes.Where(x => scopes.Contains(x)).AsQueryable();

            if(!clientScopes.Any())
            {
                response.Error = ErrorTypeEnum.InValidScope.GetEnumDescription();
                response.ErrorDescription = "scopes are invalids";
                return response;

            }

            var authoCode = new AuthorizationCode
            {
                ClientId = authorizationRequest.client_id,
                RedirectUri = authorizationRequest.redirect_uri,
                RequestedScopes = [.. clientScopes],
                IsOpenId = clientScopes.Contains("openid") || clientScopes.Contains("profile"),
                Nonce = authorizationRequest.nonce,
                CodeChallenge = authorizationRequest.code_challenge,
                CodeChallengeMethod = authorizationRequest.code_challenge_method,
                CreationTime = DateTime.UtcNow,
                Subject = httpContext.User //as ClaimsPrincipal

            };

            string code = _codeStoreService.GenerateAuthorizationCode(authorizationRequest.client_id,authoCode);
            if(code == null)
            {
                response.Error = ErrorTypeEnum.TemporarilyUnAvailable.GetEnumDescription();
                return response;
            }

            response.RedirectUri = client.Client.Redirecturi + "?code=" + code + "&state=" + httpContext.Request.Query ["state"];
            response.Code = code;
            response.State = authorizationRequest.state;
            response.RequestedScopes = [.. clientScopes];

            return response;
        }

        private CheckClientResult VerifyClientById(string clientId, bool checkWithSecret = false, string clientSecret = null)
        {
            CheckClientResult result = new() { IsSuccess = false };

            if(!string.IsNullOrWhiteSpace(clientId))
            {
                var client = _clientStore.Clients
                    .Where(x => x.Clientid.Equals(clientId, StringComparison.OrdinalIgnoreCase)).FirstOrDefault();

                if(client != null)
                {
                    if(checkWithSecret && !string.IsNullOrEmpty(clientSecret))
                    {
                        bool hasSamesecretId = client.Clientsecret.Equals(clientSecret, StringComparison.Ordinal);
                        if(!hasSamesecretId)
                        {
                            result.Error = ErrorTypeEnum.InvalidClient.GetEnumDescription();
                            return result;
                        }
                    }


                    //// check if client is enabled or not

                    //if(client.IsActive)
                    //{
                    //    result.IsSuccess = true;
                    //    result.Client = client;

                    //    return result;
                    //}
                    //else
                    //{
                    //    result.ErrorDescription = ErrorTypeEnum.UnAuthoriazedClient.GetEnumDescription();
                    //    return result;
                    //}
                }
            }

            result.ErrorDescription = ErrorTypeEnum.AccessDenied.GetEnumDescription();
            return result;
        }

        public TokenResponse GenerateTokenAsync(HttpContext httpContext)
        {
            TokenRequest request = new();

            var httpRequest = httpContext.Request;
            request.ClientId = httpRequest.Form ["client_id"];
            request.ClientSecret = httpRequest.Form ["client_secret"];
            request.Code = httpRequest.Form ["code"];
            request.GrantType = httpRequest.Form ["grant_type"];
            request.RedirectUri = httpRequest.Form ["redirect_uri"];

            var checkClientResult = VerifyClientById(request.ClientId, true, request.ClientSecret);
            if(!checkClientResult.IsSuccess)
            {
                return new TokenResponse { Error = checkClientResult.Error, ErrorDescription = checkClientResult.ErrorDescription };
            }

            // check code from the Concurrent Dictionary
            var clientCodeChecker = _codeStoreService.GetClientDataByCode(request.Code);
            if(clientCodeChecker == null)
                return new TokenResponse { Error = ErrorTypeEnum.InvalidGrant.GetEnumDescription() };


            // check if the current client who is one made this authentication request

            if(request.ClientId != clientCodeChecker.ClientId)
                return new TokenResponse { Error = ErrorTypeEnum.InvalidGrant.GetEnumDescription() };

            // TODO: 
            // also I have to check the rediret uri 
            var key_at = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyAlg));
            var credentials_at = new SigningCredentials(key_at, SecurityAlgorithms.HmacSha256);

            // Now here I will Issue the Id_token
            var handler = new JsonWebTokenHandler();

            string id_token = null;
            if(clientCodeChecker.IsOpenId)
            {
                // TO DO :D
                // Generate Identity Token

                id_token = handler.CreateToken(new SecurityTokenDescriptor()
                {
                    Claims = new Dictionary<string, object>()
                    {
                        [JwtRegisteredClaimNames.Sub] = "nigger",
                        [JwtRegisteredClaimNames.Aud] = request.ClientId,
                        [JwtRegisteredClaimNames.Iss] = "https://localhost:5069",
                        [JwtRegisteredClaimNames.Nonce] = clientCodeChecker.Nonce,
                    },
                    Expires = DateTime.Now.AddMinutes(15),
                    IssuedAt = DateTime.Now,
                    TokenType = "Bearer",
                    SigningCredentials = credentials_at
                });

            }


            var access_token = handler.CreateToken(new SecurityTokenDescriptor()
            {
                Claims  = new Dictionary<string, object>()
                {
                    [JwtRegisteredClaimNames.Iss] = "https://localhost:5069",
                    [JwtRegisteredClaimNames.Nonce] = clientCodeChecker.Nonce,
                },
                Expires = DateTime.Now.AddMinutes(2),
                IssuedAt = DateTime.Now,
                TokenType = "Bearer",
                SigningCredentials  = credentials_at,
            });

            // here remoce the code from the Concurrent Dictionary
            _codeStoreService.RemoveClientDataByCode(request.Code);

            var tokenResponse = new TokenResponse
            {
                access_token = access_token,
                id_token = id_token ?? null,
                code = request.Code,
                token_type = "Bearer"
            };

            return tokenResponse;
        }
    }
}
