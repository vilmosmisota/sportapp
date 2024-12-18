import { getBrowserClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import { UserLogin, UserLoginSchema } from "./User.schema";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getTenantInfoFromClientCookie } from "../tenant/Tenant.helpers.client";
import { getTenantInfoByDomain } from "../tenant/Tenant.services";
import {
  checkTenantUserByIds,
  getUsersByEmail,
  createUser,
  deleteUser,
  updateUser,
} from "./User.services";
import { TenantType } from "../tenant/Tenant.schema";
import { queryKeys } from "@/cacheKeys/cacheKeys";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { UserForm } from "./User.schema";

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

export function useLogIn(domain: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (formData: UserLogin) => logIn(formData, domain),
    onSuccess: (data) => {
      toast.success(`Logged in as ${data?.user.email}`);

      if (data?.tenantType === TenantType.ORGANIZATION) {
        router.push("/o/dashboard");
      } else if (data?.tenantType === TenantType.LEAGUE) {
        router.push("/l/dashboard");
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.user.login(data.tenantId),
      });
    },
    onError: (error) => {
      toast.error("Oops, something went wrong");
      console.warn(error.message);
    },
  });
}

export async function logOut() {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export function useLogOut() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: logOut,
    onSuccess: () => {
      queryClient.removeQueries();
      toast.success("Logged out, see you soon");
      router.push("/");
    },
    onError: (error) => {
      toast.error("Oops, something went wrong");
      console.warn(error.message);
    },
  });
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
  entityIds: number[],
  tenantId: string
) => {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.user.list, tenantId];

  return useMutation({
    mutationFn: ({ userData }: { userData: UserForm }) =>
      updateUser(client, userId, userData, entityIds, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
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
