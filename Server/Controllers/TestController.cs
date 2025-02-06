using Authentication.Repositories.DiscordRepository;
using Microsoft.AspNetCore.Mvc;

namespace Authentication.Controllers;

public class TestController : ControllerBase
{
    private readonly IDiscordRepository _discordRepository;

    public TestController(IDiscordRepository discordRepository)
    {
        _discordRepository = discordRepository;
    }

    [HttpGet]
    [Route("/test")]
    public async Task<IActionResult> Index()
    {
        var test = await _discordRepository.GetUsers();
        return Ok(test);
    }
}