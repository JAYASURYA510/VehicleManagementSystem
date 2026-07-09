using FleetPro.API.Authorization;
using FleetPro.API.Data;
using FleetPro.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FleetPro.API.Controllers;

public abstract class ExpenseControllerBase<T>(ApplicationDbContext db, string includeVehicle = "") : ControllerBase
    where T : class
{
    protected readonly ApplicationDbContext Db = db;
    protected abstract DbSet<T> Set { get; }
    protected abstract AppModule Module { get; }

    protected IQueryable<T> QueryWithVehicle()
    {
        var query = Set.AsQueryable();
        if (!string.IsNullOrEmpty(includeVehicle))
            query = query.Include(includeVehicle);
        return query;
    }

    [HttpGet]
    [Authorize]
    public virtual async Task<ActionResult<List<T>>> GetAll([FromQuery] int? vehicleId)
    {
        if (!PermissionChecker.HasPermission(User, Module, "Read")) return Forbid();
        var query = QueryWithVehicle();
        if (vehicleId.HasValue)
            query = query.Where(e => EF.Property<int>(e, "VehicleId") == vehicleId.Value);
        return Ok(await query.OrderByDescending(e => EF.Property<DateTime>(e, "Date")).ToListAsync());
    }

    [HttpGet("{id}")]
    [Authorize]
    public virtual async Task<ActionResult<T>> Get(int id)
    {
        if (!PermissionChecker.HasPermission(User, Module, "Read")) return Forbid();
        var item = await QueryWithVehicle().FirstOrDefaultAsync(e => EF.Property<int>(e, "Id") == id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [Authorize]
    public virtual async Task<ActionResult<T>> Create([FromBody] T item)
    {
        if (!PermissionChecker.HasPermission(User, Module, "Write")) return Forbid();
        typeof(T).GetProperty("CreatedByUserId")!.SetValue(item, User.GetUserId());
        typeof(T).GetProperty("CreatedAt")!.SetValue(item, DateTime.UtcNow);
        Set.Add(item);
        await Db.SaveChangesAsync();
        var newId = (int)typeof(T).GetProperty("Id")!.GetValue(item)!;
        return CreatedAtAction(nameof(Get), new { id = newId }, item);
    }

    [HttpPut("{id}")]
    [Authorize]
    public virtual async Task<IActionResult> Update(int id, [FromBody] T item)
    {
        if (!PermissionChecker.HasPermission(User, Module, "Edit")) return Forbid();
        if ((int)typeof(T).GetProperty("Id")!.GetValue(item)! != id) return BadRequest();
        Db.Entry(item).State = EntityState.Modified;
        await Db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize]
    public virtual async Task<IActionResult> Delete(int id)
    {
        if (!PermissionChecker.HasPermission(User, Module, "Edit")) return Forbid();
        var item = await Set.FindAsync(id);
        if (item is null) return NotFound();
        Set.Remove(item);
        await Db.SaveChangesAsync();
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DieselExpensesController(ApplicationDbContext db) : ExpenseControllerBase<DieselExpense>(db, "Vehicle")
{
    protected override DbSet<DieselExpense> Set => Db.DieselExpenses;
    protected override AppModule Module => AppModule.Diesel;
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TollChargesController(ApplicationDbContext db) : ExpenseControllerBase<TollCharge>(db, "Vehicle")
{
    protected override DbSet<TollCharge> Set => Db.TollCharges;
    protected override AppModule Module => AppModule.Toll;
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TripDetailsController(ApplicationDbContext db) : ExpenseControllerBase<TripDetail>(db, "Vehicle")
{
    protected override DbSet<TripDetail> Set => Db.TripDetails;
    protected override AppModule Module => AppModule.Trip;
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InsurancesController(ApplicationDbContext db) : ExpenseControllerBase<Insurance>(db, "Vehicle")
{
    protected override DbSet<Insurance> Set => Db.Insurances;
    protected override AppModule Module => AppModule.Insurance;
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkshopsController(ApplicationDbContext db) : ExpenseControllerBase<Workshop>(db, "Vehicle")
{
    protected override DbSet<Workshop> Set => Db.Workshops;
    protected override AppModule Module => AppModule.Workshop;
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TyresController(ApplicationDbContext db) : ExpenseControllerBase<Tyre>(db, "Vehicle")
{
    protected override DbSet<Tyre> Set => Db.Tyres;
    protected override AppModule Module => AppModule.Tyre;
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SalariesController(ApplicationDbContext db) : ExpenseControllerBase<Salary>(db, "Vehicle")
{
    protected override DbSet<Salary> Set => Db.Salaries;
    protected override AppModule Module => AppModule.Salary;

    public override async Task<ActionResult<List<Salary>>> GetAll([FromQuery] int? vehicleId)
    {
        if (!PermissionChecker.HasPermission(User, Module, "Read")) return Forbid();
        var query = QueryWithVehicle();
        if (vehicleId.HasValue)
            query = query.Where(s => s.VehicleId == vehicleId);
        return Ok(await query.OrderByDescending(s => s.Year).ThenByDescending(s => s.Month).ToListAsync());
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RTOChargesController(ApplicationDbContext db) : ExpenseControllerBase<RTOCharge>(db, "Vehicle")
{
    protected override DbSet<RTOCharge> Set => Db.RTOCharges;
    protected override AppModule Module => AppModule.RTO;
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfitRecordsController(ApplicationDbContext db) : ExpenseControllerBase<ProfitRecord>(db, "Vehicle")
{
    protected override DbSet<ProfitRecord> Set => Db.ProfitRecords;
    protected override AppModule Module => AppModule.Profit;
}
