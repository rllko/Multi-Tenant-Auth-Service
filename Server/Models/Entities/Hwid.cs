using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Authentication.Models.Entities;

[Table("hwids")]
[Index("Bios", Name = "hwids_bios_key", IsUnique = true)]
[Index("Cpu", Name = "hwids_cpu_key", IsUnique = true)]
[Index("Disk", Name = "hwids_disk_key", IsUnique = true)]
[Index("Display", Name = "hwids_display_key", IsUnique = true)]
[Index("Ram", Name = "hwids_ram_key", IsUnique = true)]
public class Hwid
{
    public Hwid(long id, string cpu, string bios, string ram, string disk, string display)
    {
        Id = id;
        Cpu = cpu;
        Bios = bios;
        Ram = ram;
        Disk = disk;
        Display = display;
    }

    [Key] [Column("id")] public long Id { get; set; }

    [Column("cpu")] [StringLength(64)] public string Cpu { get; set; } = null!;

    [Column("bios")] [StringLength(64)] public string Bios { get; set; } = null!;

    [Column("ram")] [StringLength(64)] public string Ram { get; set; } = null!;

    [Column("disk")] [StringLength(64)] public string Disk { get; set; } = null!;

    [Column("display")] [StringLength(64)] public string Display { get; set; } = null!;

    [InverseProperty("Hw")] public virtual ICollection<License> Users { get; set; } = new List<License>();
}

public record HwidDto(string cpu, string bios, string ram, string disk, string display)
{
    public static HwidDto? MapFromString(string hwid)
    {
        var filteredInput = hwid.Split('+').ToList();

        if (filteredInput.Count is not 5) return null;

        foreach (var item in filteredInput)
            if (item!.Length is not 64)
                return null;

        return new HwidDto(filteredInput[0], filteredInput[1], filteredInput[2],
            filteredInput[3], filteredInput[4]);
    }

    public Hwid ToHwid(long id)
    {
        return new Hwid(id, cpu, bios, ram, disk, display);
    }
}