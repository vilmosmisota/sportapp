import { queryKeys } from "@/cacheKeys/cacheKeys";
import { getBrowserClient } from "@/libs/supabase/client";
import { useSupabase } from "@/libs/supabase/useSupabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getTenantByDomain } from "../tenant/Tenant.services";
import {
  CreateUser,
  UpdateUser,
  UserLogin,
  UserLoginSchema,
} from "./User.schema";

export async function logIn(formData: UserLogin, domain: string) {
  const parsedData = UserLoginSchema.safeParse(formData);

  if (!parsedData.success) {
    throw new Error("Invalid form data");
  }

  const supabase = getBrowserClient();

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

  const tenant = await getTenantByDomain(domain, supabase);
  if (!tenant) {
    throw new Error("Tenant not found");
  }
  const tenantId = tenant.id.toString();
  const tenantType = tenant.type;

  const { data: tenantUser, error: tenantUserError } = await supabase
    .from("tenantUsers")
    .select("id")
    .eq("userId", authData.user.id)
    .eq("tenantId", tenantId)
    .maybeSingle();

  if (tenantUserError || !tenantUser) {
    await supabase.auth.signOut();
    throw new Error("You don't have access to this tenant");
  }

  return { user: authData.user, tenantType, tenantId };
}

export const useAddUser = (tenantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userData }: { userData: CreateUser }) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userData, tenantId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Enhanced error handling for detailed API responses
        if (response.status === 409 && data.details) {
          // User already exists - show detailed info
          const details = data.details;
          let errorMessage = `User ${details.email} is already a member of this tenant.`;

          if (details.existingMember) {
            errorMessage += `\n\nExisting member: ${details.existingMember.name} (${details.existingMember.type})`;
          }

          errorMessage += `\n\nUser ID: ${details.userId}`;

          throw new Error(errorMessage);
        }

        // Standard error handling
        throw new Error(data.error || "Failed to add user");
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate multiple related queries
      queryClient.invalidateQueries({ queryKey: [queryKeys.users.all] });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.user.list, tenantId],
      });
      queryClient.invalidateQueries({ queryKey: [queryKeys.user.current] });

      // Invalidate member queries since we create/update members
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.member.all });

      // Show appropriate success message
      if (data.message) {
        toast.success(data.message);
      }
    },
  });
};

export const useUpdateUser = (userId: string, tenantId: string) => {
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.user.list, tenantId];

  return useMutation({
    mutationFn: async ({ userData }: { userData: UpdateUser }) => {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userData, tenantId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current });
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.role.userRoles });

      // Invalidate member queries since we update members
      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.member.all });
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
      queryClient.invalidateQueries({ queryKey: [queryKeys.users.all] });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.user.list, tenantId],
      });
      queryClient.invalidateQueries({ queryKey: [queryKeys.user.current] });

      queryClient.invalidateQueries({
        queryKey: queryKeys.member.list(tenantId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.member.all });
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
    onSuccess: () => {
      router.push(`/app/`);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current });
      router.refresh();
      toast.success("Successfully signed in!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
