namespace HeadHunter.Models.Entities
{
    public class ClientScope
    {
        public int ClientId { get; set; }
        public Client Client { get; set; }

        public int ScopeId { get; set; }
        public Scope Scope { get; set; }
    }
}
