import { getBrowserClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import {
  UserLogin,
  UserLoginSchema,
  UserForm,
  UserUpdateForm,
} from "./User.schema";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getTenantInfoFromClientCookie } from "../tenant/Tenant.helpers.client";
import { getTenantInfoByDomain } from "../tenant/Tenant.services";
import {
  checkTenantUserByIds,
  createUser,
  deleteUser,
  updateUser,
} from "./User.services";
import { TenantType } from "../tenant/Tenant.schema";
import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";

export async function logIn(formData: UserLogin, domain: string) {
  const parsedData = UserLoginSchema.safeParse(formData);

  if (!parsedData.success) {
    throw new Error("Invalid form data");
  }

  const supabase = getBrowserClient();

  // First attempt to sign in
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: parsedData.data.email,
      password: parsedData.data.password,
    });

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error("No user found");
  }

  // Then get tenant info
  let tenantId: string;
  let tenantType: string;

  const tenantUserInfo = getTenantInfoFromClientCookie(domain);

  if (!tenantUserInfo) {
    const tenantInfo = await getTenantInfoByDomain(domain, supabase);
    if (!tenantInfo) {
      throw new Error("Tenant not found");
    }
    tenantId = tenantInfo.tenantId.toString();
    tenantType = tenantInfo.tenantType;
  } else {
    tenantId = tenantUserInfo.tenantId;
    tenantType = tenantUserInfo.tenantType;
  }

  // Verify user has access to this tenant
  const checkedTenantUser = await checkTenantUserByIds(
    supabase,
    tenantId,
    authData.user.id
  );

  if (!checkedTenantUser) {
    // If user doesn't have access, sign them out
    await supabase.auth.signOut();
    throw new Error("You don't have access to this tenant");
  }

  return { user: authData.user, tenantType, tenantId };
}

export const useAddUser = (tenantId: string) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.users.all];

  return useMutation({
    mutationFn: ({ userData }: { userData: UserForm }) =>
      createUser(client, userData, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useUpdateUser = (
  userId: string,
  entityId: number,
  tenantId: string
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.user.list, tenantId];

  return useMutation({
    mutationFn: ({ userData }: { userData: UserUpdateForm }) =>
      updateUser(client, userId, userData, entityId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.user.list, tenantId],
      });
    },
  });
};

export const useDeleteUser = () => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.users.all];

  return useMutation({
    mutationFn: (userId: string) => deleteUser(client, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useLogOut = () => {
  const client = useSupabase();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await client.auth.signOut();
      router.refresh();
    },
  });
};

export const useLogIn = (domain: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: UserLogin) => logIn(formData, domain),
    onSuccess: ({ tenantType }) => {
      // Redirect based on tenant type
      if (tenantType === TenantType.ORGANIZATION) {
        router.push("/o/dashboard");
      } else if (tenantType === TenantType.LEAGUE) {
        router.push("/l/dashboard");
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current });
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
