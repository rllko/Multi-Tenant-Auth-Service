namespace HeadHunter.Models
{
    public class CheckClientResult
    {
        public Client Client { get; set; }

        /// <summary>
        /// The clinet is found in my Clients Store
        /// </summary>
        public bool IsSuccess { get; set; } = false;
        public string Error { get; set; }

        public string ErrorDescription { get; set; }
    }
}
