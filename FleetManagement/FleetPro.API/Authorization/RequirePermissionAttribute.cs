using System.Security.Claims;
using FleetPro.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FleetPro.API.Authorization;

public static class PermissionChecker
{
    public static bool HasPermission(ClaimsPrincipal user, AppModule module, string action)
    {
        if (!user.Identity?.IsAuthenticated ?? true) return false;
        if (user.IsInRole(UserRole.SuperAdmin.ToString())) return true;

        var claim = user.FindFirst($"perm_{module}");
        if (claim is null) return false;

        var parts = claim.Value.Split(',');
        if (parts.Length != 4) return false;

        var canView = bool.Parse(parts[0]);
        var canRead = bool.Parse(parts[1]);
        var canWrite = bool.Parse(parts[2]);
        var canEdit = bool.Parse(parts[3]);

        return action switch
        {
            "View" => canView,
            "Read" => canRead || canView,
            "Write" => canWrite,
            "Edit" => canEdit,
            _ => canRead
        };
    }
}

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequirePermissionAttribute(AppModule module, string action = "Read") : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        if (!PermissionChecker.HasPermission(context.HttpContext.User, module, action))
            context.Result = new ForbidResult();
    }
}

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user) =>
        int.Parse(user.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)!);
}
