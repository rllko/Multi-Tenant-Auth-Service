namespace Authentication.Attributes;

[AttributeUsage(AttributeTargets.Method)]
public class RequiresPermissionAttribute : Attribute
{
    public RequiresPermissionAttribute(string permission)
    {
        Permission = permission;
    }

    public string Permission { get; }
}