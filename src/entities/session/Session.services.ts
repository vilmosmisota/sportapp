import { TypedClient } from "@/libs/supabase/type";
import {
  Session,
  SessionQueryParams,
  SessionSchema,
  SessionWithGroup,
  SessionWithGroupSchema,
} from "./Session.schema";

export const getSessionsWithGroup = async (
  client: TypedClient,
  params: SessionQueryParams
): Promise<SessionWithGroup[]> => {
  let query = client
    .from("sessions")
    .select(
      `
      *,
      group:groups(*)
    `
    )
    .eq("tenantId", params.tenantId)
    .eq("groupId", params.groupId)
    .eq("seasonId", params.seasonId);

  if (params.dateRange) {
    query = query
      .gte("date", params.dateRange.from)
      .lte("date", params.dateRange.to);
  }

  query = query
    .order("date", { ascending: true })
    .order("startTime", { ascending: true });

  const { data, error } = await query;

  if (error) throw error;

  if (!data) return [];

  try {
    const validatedData = data.map((item) =>
      SessionWithGroupSchema.parse(item)
    );
    return validatedData;
  } catch (validationError) {
    console.error("Session data validation failed:", validationError);
    throw new Error("Invalid session data received from database");
  }
};

export const getSessionsByGroup = async (
  client: TypedClient,
  tenantId: string,
  groupId: number
): Promise<Session[]> => {
  const { data, error } = await client
    .from("sessions")
    .select("*")
    .eq("tenantId", Number(tenantId))
    .eq("groupId", groupId)
    .order("date", { ascending: true })
    .order("startTime", { ascending: true });

  if (error) throw error;

  // Validate data before returning
  if (!data) return [];

  try {
    const validatedData = data.map((item) => SessionSchema.parse(item));
    return validatedData;
  } catch (validationError) {
    console.error("Session data validation failed:", validationError);
    throw new Error("Invalid session data received from database");
  }
};

export const getSessionsByTenant = async (
  client: TypedClient,
  tenantId: string
): Promise<Session[]> => {
  const { data, error } = await client
    .from("sessions")
    .select("*")
    .eq("tenantId", Number(tenantId))
    .order("date", { ascending: true })
    .order("startTime", { ascending: true });

  if (error) throw error;

  // Validate data before returning
  if (!data) return [];

  try {
    const validatedData = data.map((item) => SessionSchema.parse(item));
    return validatedData;
  } catch (validationError) {
    console.error("Session data validation failed:", validationError);
    throw new Error("Invalid session data received from database");
  }
};

export const getSessionById = async (
  client: TypedClient,
  tenantId: string,
  sessionId: number
): Promise<Session | null> => {
  const { data, error } = await client
    .from("sessions")
    .select("*")
    .eq("tenantId", Number(tenantId))
    .eq("id", sessionId)
    .single();

  if (error) throw error;

  // Validate data before returning
  if (!data) return null;

  try {
    const validatedData = SessionSchema.parse(data);
    return validatedData;
  } catch (validationError) {
    console.error("Session data validation failed:", validationError);
    throw new Error("Invalid session data received from database");
  }
};

export const createSession = async (
  client: TypedClient,
  tenantId: string,
  sessionData: Omit<Session, "id" | "tenantId">
): Promise<Session> => {
  const { data, error } = await client
    .from("sessions")
    .insert({
      ...sessionData,
      tenantId: Number(tenantId),
    })
    .select()
    .single();

  if (error) throw error;

  // Validate data before returning
  try {
    const validatedData = SessionSchema.parse(data);
    return validatedData;
  } catch (validationError) {
    console.error("Session data validation failed:", validationError);
    throw new Error("Invalid session data received from database");
  }
};

/**
 * Create multiple sessions in a single batch operation
 * This is much more efficient than creating sessions one by one
 */
export const createMultipleSessions = async (
  client: TypedClient,
  tenantId: string,
  sessionsData: Omit<Session, "id" | "tenantId">[]
): Promise<Session[]> => {
  // Prepare the data with tenantId
  const sessionsToInsert = sessionsData.map((sessionData) => ({
    ...sessionData,
    tenantId: Number(tenantId),
  }));

  const { data, error } = await client
    .from("sessions")
    .insert(sessionsToInsert)
    .select();

  if (error) throw error;

  // Validate data before returning
  if (!data) return [];

  try {
    const validatedData = data.map((item) => SessionSchema.parse(item));
    return validatedData;
  } catch (validationError) {
    console.error("Session data validation failed:", validationError);
    throw new Error("Invalid session data received from database");
  }
};

export const updateSession = async (
  client: TypedClient,
  sessionId: number,
  tenantId: string,
  sessionData: Partial<Omit<Session, "id" | "tenantId">>
): Promise<Session> => {
  const { data, error } = await client
    .from("sessions")
    .update(sessionData)
    .eq("id", sessionId)
    .eq("tenantId", Number(tenantId))
    .select()
    .single();

  if (error) throw error;

  // Validate data before returning
  try {
    const validatedData = SessionSchema.parse(data);
    return validatedData;
  } catch (validationError) {
    console.error("Session data validation failed:", validationError);
    throw new Error("Invalid session data received from database");
  }
};

export const deleteSession = async (
  client: TypedClient,
  sessionId: number,
  tenantId: string
): Promise<boolean> => {
  const { error } = await client
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("tenantId", Number(tenantId));

  if (error) throw error;

  return true;
};

export const getSessionsByTenantForDays = async (
  client: TypedClient,
  tenantId: string,
  days: number
): Promise<SessionWithGroup[]> => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  const fromDate = today.toISOString().split("T")[0];
  const toDate = futureDate.toISOString().split("T")[0];

  const { data, error } = await client
    .from("sessions")
    .select(
      `
      *,
      group:groups(*)
    `
    )
    .eq("tenantId", Number(tenantId))
    .gte("date", fromDate)
    .lte("date", toDate)
    .order("date", { ascending: true })
    .order("startTime", { ascending: true });

  if (error) throw error;

  if (!data) return [];

  try {
    const validatedData = data.map((item) =>
      SessionWithGroupSchema.parse(item)
    );
    return validatedData;
  } catch (validationError) {
    console.error("Session data validation failed:", validationError);
    throw new Error("Invalid session data received from database");
  }
};
