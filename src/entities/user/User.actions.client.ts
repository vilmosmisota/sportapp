import { getBrowserClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import { UserLogin, UserLoginSchema } from "./User.schema";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export async function logIn(formData: UserLogin) {
  const parsedData = UserLoginSchema.safeParse(formData);

  if (!parsedData.success) {
    throw new Error("Invalid form data");
  }

  const supabase = getBrowserClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsedData.data.email,
    password: parsedData.data.password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export function useLogIn() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (formData: UserLogin) => logIn(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["login"] });
      toast.success(`Logged in as ${data?.user.email}`);
      router.push("/dashboard");
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
