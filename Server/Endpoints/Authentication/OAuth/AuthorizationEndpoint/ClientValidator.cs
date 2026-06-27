using Authentication.Models.Entities;
using FluentValidation;

namespace Authentication.Endpoints.Authentication.OAuth.AuthorizationEndpoint;

public class ClientValidator : AbstractValidator<Client>
{
}