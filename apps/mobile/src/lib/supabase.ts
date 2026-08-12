import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string | undefined;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env config (extra.supabaseUrl / extra.supabaseAnonKey)");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
