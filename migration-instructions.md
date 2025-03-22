# Game View Migration Instructions

This document provides instructions for updating the `vw_games_with_details` view in your Supabase database to include appearance information and simplify the structure.

## Automatic Migration

If your Supabase instance is running, you can apply the migration automatically:

```bash
npx supabase migration up
```

## Manual SQL Application

If the automatic migration fails, you can execute the following SQL directly in your Supabase SQL editor:

```sql
-- Drop the existing view first
DROP VIEW IF EXISTS public.vw_games_with_details;

-- Recreate the view with appearance information and simplified structure
CREATE OR REPLACE VIEW public.vw_games_with_details AS
SELECT
  g.id,
  g.date,
  g."startTime",
  g."endTime",
  g.location,
  g."homeScore",
  g."awayScore",
  g.status,
  g."tenantId",
  g."seasonId",
  g."homeTeamId",
  g."awayTeamId",

  -- Tenant team data - the team owned by our tenant (no opponentId)
  CASE
    WHEN t1."opponentId" IS NULL THEN
      jsonb_build_object(
        'id', t1.id,
        'age', t1.age,
        'gender', t1.gender,
        'name', tn1.name,
        'tenantId', t1."tenantId",
        'isHomeTeam', true,
        'appearance', t1.appearance
      )
    WHEN t2."opponentId" IS NULL THEN
      jsonb_build_object(
        'id', t2.id,
        'age', t2.age,
        'gender', t2.gender,
        'name', tn2.name,
        'tenantId', t2."tenantId",
        'isHomeTeam', false,
        'appearance', t2.appearance
      )
    ELSE null
  END as "tenantTeam",

  -- Opponent team data - team with opponentId
  CASE
    WHEN t1."opponentId" IS NOT NULL THEN
      jsonb_build_object(
        'id', t1.id,
        'age', t1.age,
        'gender', t1.gender,
        'name', o1.name,
        'opponentId', t1."opponentId",
        'tenantId', t1."tenantId",
        'isHomeTeam', true,
        'appearance', COALESCE(t1.appearance, o1.appearance)
      )
    WHEN t2."opponentId" IS NOT NULL THEN
      jsonb_build_object(
        'id', t2.id,
        'age', t2.age,
        'gender', t2.gender,
        'name', o2.name,
        'opponentId', t2."opponentId",
        'tenantId', t2."tenantId",
        'isHomeTeam', false,
        'appearance', COALESCE(t2.appearance, o2.appearance)
      )
    ELSE null
  END as "opponentTeam"

FROM
  public.games g
JOIN
  public.teams t1 ON g."homeTeamId" = t1.id
JOIN
  public.teams t2 ON g."awayTeamId" = t2.id
-- Always join with tenants since all teams have a tenantId in the multi-tenant model
JOIN
  public.tenants tn1 ON t1."tenantId" = tn1.id
JOIN
  public.tenants tn2 ON t2."tenantId" = tn2.id
-- Left join with opponents since only opponent teams have an opponentId
LEFT JOIN
  public.opponents o1 ON t1."opponentId" = o1.id
LEFT JOIN
  public.opponents o2 ON t2."opponentId" = o2.id;

-- Add comment to explain the view's purpose
COMMENT ON VIEW public.vw_games_with_details IS
  'Provides game details with tenant and opponent team information including appearance data';
```

## Changes Made

The following changes were made to the view:

1. Removed unnecessary fields:

   - `hasTenantTeam`
   - `hasOpponentTeam`
   - `isTenantTeamHome`

2. Added appearance information:

   - Added `appearance` to the `tenantTeam` JSON object
   - Added `appearance` to the `opponentTeam` JSON object using COALESCE to use either the team's appearance or the opponent's appearance

3. Added `homeTeamId` and `awayTeamId` for direct access to these IDs

## Frontend Changes

The TypeScript interface for `GameWithViewDetails` was also updated to include these changes:

```typescript
interface GameWithViewDetails extends Game {
  tenantTeam?: {
    id: number;
    age: number;
    gender: string;
    name: string;
    tenantId: number;
    isHomeTeam: boolean;
    appearance?: Appearance;
  };
  opponentTeam?: {
    id: number;
    age: number;
    gender: string;
    name: string;
    opponentId: number;
    tenantId: number;
    isHomeTeam: boolean;
    appearance?: Appearance;
  };
  // These fields have been removed from the view
  // hasTenantTeam?: boolean;
  // hasOpponentTeam?: boolean;
  // isTenantTeamHome?: boolean;
}
```

And the event transformer code now uses the appearance colors when available:

```typescript
homeTeamInfo = {
  name: tenantName,
  color: tenantTeam.appearance?.color || "#1a73e8", // Use the appearance color if available
  details: formatTeamDetails(tenantTeam),
};
```
