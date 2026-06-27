namespace Authentication.Attributes;

[AttributeUsage(AttributeTargets.Method)]
public class RequiresScopeAttribute : Attribute
{
    public RequiresScopeAttribute(string permission)
    {
        Permission = permission;
    }

    public string Permission { get; }
}