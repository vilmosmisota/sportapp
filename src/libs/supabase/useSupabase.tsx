import { useMemo } from "react";
import { getBrowserClient } from "./client";

export const useSupabase = () => {
  return useMemo(getBrowserClient, []);
};
