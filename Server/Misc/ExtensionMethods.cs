using System.ComponentModel;
using Authentication.Models.Entities;

namespace Authentication.Common;

public static class ExtensionMethods
{
    public static string GetEnumDescription(this Enum en)
    {
        var type = en!.GetType();

        var memberInfo = type.GetMember(en.ToString());
        var description = (memberInfo[0].GetCustomAttributes(typeof(DescriptionAttribute),
            false).FirstOrDefault() as DescriptionAttribute)?.Description;

        return description!;
    }

    public static bool EqualsCheck(this Hwid hwid, Hwid otherHwid)
    {
        //   if (hwid.isNotUsed()) return true;

        if (hwid.Bios != otherHwid.Bios || hwid.Cpu != otherHwid.Cpu) return false;

        var differences = 0;

        differences += hwid.Ram == otherHwid.Ram ? 0 : 1;
        differences += hwid.Disk == otherHwid.Disk ? 0 : 1;
        differences += hwid.Display == otherHwid.Display ? 0 : 1;


        return differences <= 1;
    }
}