using HeadHunter.Common;
using HeadHunter.Models;

namespace HeadHunter.OauthResponse
{
    public class TokenResponse
    {
        /// <summary>
        /// Oauth 2
        /// </summary>
        public string access_token { get; set; }

        /// <summary>
        /// OpenId Connect
        /// </summary>
        public string? id_token { get; set; }

        /// <summary>
        /// By default is Bearer
        /// </summary>

        public string code { get; set; }

        public string token_type { get; set; } = TokenTypeEnum.Bearer.GetEnumDescription();

        // For Error Details if any

        public string Error { get; set; } = string.Empty;
        public string ErrorUri { get; set; }
        public string ErrorDescription { get; set; }
        public bool HasError => !string.IsNullOrEmpty(Error);
    }
}
