using FleetPro.API.Data.Entitys;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FleetPro.API.Data.Entitys
{
    [Table("image_atch_mst")]
    public class ImageAttachment
    {
       [Key]
       [Column("id")]
       public Guid Id { get; set; }
       
       [Column("daily_tracking_id")]
       public Guid? DailyTrackingId { get; set; }

       [Column("file_name")]
       public string FileName { get; set; } = string.Empty;

       [Column("file_path")]
       public string FilePath { get; set; } = string.Empty;

       [Column("file_type")]
       public string? FileType { get; set; }

       [Column("image_type")]
       public string ImageType { get; set; } = string.Empty;

       [Column("is_delete")]
       public bool IsDelete { get; set; }

       [Column("created_at")]
       public DateTime? CreatedAt { get; set; }
       
       [Column("created_by")]
       public int? CreatedBy { get; set; }

       [Column("updated_at")]
       public DateTime? UpdatedAt { get; set; }

       [Column("updated_by")]
       public int? UpdatedBy { get; set; }
    }
}
