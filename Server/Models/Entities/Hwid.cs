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
    [Key] [Column("id")] public long Id { get; set; }

    [Column("cpu")] [StringLength(64)] public string Cpu { get; set; } = null!;

    [Column("bios")] [StringLength(64)] public string Bios { get; set; } = null!;

    [Column("ram")] [StringLength(64)] public string Ram { get; set; } = null!;

    [Column("disk")] [StringLength(64)] public string Disk { get; set; } = null!;

    [Column("display")] [StringLength(64)] public string Display { get; set; } = null!;

    [InverseProperty("Hw")] public virtual ICollection<License> Users { get; set; } = new List<License>();
}