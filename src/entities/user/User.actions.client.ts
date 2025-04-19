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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userData }: { userData: UserForm }) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userData, tenantId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate multiple related queries
      queryClient.invalidateQueries({ queryKey: [queryKeys.users.all] });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.user.list, tenantId],
      });
      queryClient.invalidateQueries({ queryKey: [queryKeys.user.current] });
    },
  });
};

export const useUpdateUser = (userId: string, tenantId: string) => {
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.user.list, tenantId];

  return useMutation({
    mutationFn: async ({
      userData,
      roleIds,
    }: {
      userData: {
        email: string;
        firstName: string;
        lastName: string;
      };
      roleIds?: number[];
    }) => {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userData, tenantId, roleIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current });
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.role.userRoles });
    },
  });
};

export const useDeleteUser = (tenantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tenantId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate multiple related queries
      queryClient.invalidateQueries({ queryKey: [queryKeys.users.all] });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.user.list, tenantId],
      });
      queryClient.invalidateQueries({ queryKey: [queryKeys.user.current] });
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
      // Redirect based on tenant type with domain
      if (tenantType === TenantType.ORGANIZATION) {
        router.push(`/o/dashboard`);
      } else if (tenantType === TenantType.LEAGUE) {
        router.push(`/l/dashboard`);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current });
      router.refresh();
      toast.success("Successfully signed in!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
