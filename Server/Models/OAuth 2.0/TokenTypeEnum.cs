using System.ComponentModel;

namespace Authentication.Models;

public enum TokenTypeEnum : byte
{
    [Description("Bearer")] Bearer
}