import { getAdminClient } from "@/libs/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userData, tenantId } = await request.json();
    const adminClient = getAdminClient();

    console.log("userData", userData);
    console.log("tenantId,", tenantId);

    // Create auth user with metadata
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
      });

    console.log("authData", authData);
    console.log("authError", authError);

    if (authError) throw new Error(`Auth error: ${authError.message}`);
    if (!authData?.user)
      throw new Error("No user data returned from auth creation");

    // Create user entity
    const { data: entity, error: entityError } = await adminClient
      .from("userEntities")
      .insert({
        userId: authData.user.id,
        tenantId: Number(tenantId),
        adminRole: userData.adminRole,
        domainRole: userData.domainRole,
        clubId: userData.clubId,
        divisionId: userData.divisionId,
        teamId: userData.teamId,
      })
      .select()
      .single();

    if (entityError) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Entity error: ${entityError.message}`);
    }

    return NextResponse.json({ user: authData.user, entity });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, userData, entityId, tenantId } = await request.json();
    const adminClient = getAdminClient();

    // Update auth user
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      userId,
      {
        email: userData.email,
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
      }
    );
    if (authError) throw new Error(authError.message);

    // Update users table
    const { error: userError } = await adminClient
      .from("users")
      .update({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      })
      .eq("id", userId);

    if (userError) throw new Error(userError.message);

    // Update entity
    const { data: entity, error: entityError } = await adminClient
      .from("userEntities")
      .update({
        adminRole: userData.adminRole,
        domainRole: userData.domainRole,
        clubId: userData.clubId,
        divisionId: userData.divisionId,
        teamId: userData.teamId,
      })
      .eq("id", entityId)
      .select()
      .single();

    if (entityError) throw new Error(entityError.message);

    return NextResponse.json({ entity });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();
    const adminClient = getAdminClient();

    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
