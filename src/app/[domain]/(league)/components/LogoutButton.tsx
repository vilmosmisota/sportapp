"use client";

import { Button } from "@/components/ui/button";
import { logOut } from "@/entities/user/User.actions.client";

export default function LogoutButton() {
  return <Button onClick={logOut}>Logout</Button>;
}
