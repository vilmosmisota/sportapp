import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().trim().email({ message: "Invalid email address " }),
  firstName: z.string().trim().min(1, { message: "First name is required" }),
  lastName: z.string().trim().min(1, { message: "Last name is required" }),
});

// firstName: z.string().trim().min(1, { message: "First name is required" }),
// lastName: z.string().trim().min(1, { message: "Last name is required" }),

export const UserLoginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address " }),
  password: z.string().trim().min(1, { message: "Password is required" }),
});

export type UserLogin = z.infer<typeof UserLoginSchema>;
