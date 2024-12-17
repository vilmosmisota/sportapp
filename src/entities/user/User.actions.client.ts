import { getBrowserClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import { UserLogin, UserLoginSchema } from "./User.schema";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getTenantInfoFromClientCookie } from "../tenant/Tenant.helpers.client";
import { getTenantInfoByDomain } from "../tenant/Tenant.services";
import { checkTenantUserByIds, getUsersByEmail } from "./User.services";
import { TenantType } from "../tenant/Tenant.schema";
import { queryKeys } from "@/cacheKeys/cacheKeys";

export async function logIn(formData: UserLogin, domain: string) {
  const parsedData = UserLoginSchema.safeParse(formData);

  if (!parsedData.success) {
    throw new Error("Invalid form data");
  }

  const supabase = getBrowserClient();

  const user = await getUsersByEmail(supabase, parsedData.data.email);

  if (!user) {
    throw new Error("User not found");
  }

  let tenantId: string;
  let tenantType: string;

  const tenantUserInfo = getTenantInfoFromClientCookie(domain);

  if (!tenantUserInfo) {
    const tenantInfo = await getTenantInfoByDomain(domain, supabase);

    console.log("tenantInfo", tenantInfo);

    if (!tenantInfo) {
      throw new Error("Tenant not found");
    } else {
      tenantId = tenantInfo.tenantId.toString();
      tenantType = tenantInfo.tenantType;
    }
  } else {
    tenantId = tenantUserInfo.tenantId;
    tenantType = tenantUserInfo.tenantType;
  }

  const checkedTenantUser = await checkTenantUserByIds(
    supabase,
    tenantId,
    user.id
  );

  if (!checkedTenantUser) {
    throw new Error("Tenant user not found");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsedData.data.email,
    password: parsedData.data.password,
  });

  if (error) {
    throw error;
  }

  return { user: data.user, tenantType, tenantId };
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
