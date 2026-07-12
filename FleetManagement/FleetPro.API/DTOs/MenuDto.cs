using System.ComponentModel.DataAnnotations.Schema;

namespace FleetPro.API.DTOs
{
    public class MenuDto
    {
        public int Id { get; set; }

        public string MenuName { get; set; }

        public string Icon { get; set; }

        public string Route { get; set; }

        public int? ParentId { get; set; }

        public List<MenuDto> Children { get; set; } = new();
    }

    public class RoleDto
    {
        public int Id { get; set; }
        public string RoleName { get; set; }
    }

    public class MenuTypesDto
    {
        public int Id { get; set; }
        public string MenuName { get; set; }

        public string? Icon { get; set; }

        public string Route { get; set; }
        public int? ParentId { get; set; }
        public int? ParentName { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; }
    }
}
