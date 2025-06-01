-- Add unique constraint for pin within tenant
-- This ensures that each pin is unique within a specific tenant, but allows the same pin across different tenants
alter table public."performerVerification" 
add constraint "performerVerification_pin_tenantId_unique" 
unique ("pin", "tenantId");

-- Add index on tenantId for faster lookups by tenant
-- This will improve performance when querying performer verifications for a specific tenant
create index "performerVerification_tenantId_idx" 
on public."performerVerification" ("tenantId");

-- Add index on pin for faster lookups by pin
-- This will improve performance when searching for a specific pin
create index "performerVerification_pin_idx" 
on public."performerVerification" ("pin");

-- Add composite index on (tenantId, pin) for optimal performance on the unique constraint
-- This index will be automatically created by the unique constraint, but we're being explicit
-- Note: The unique constraint already creates this index, so this is optional
-- create index "performerVerification_tenantId_pin_idx" 
-- on public."performerVerification" ("tenantId", "pin"); 