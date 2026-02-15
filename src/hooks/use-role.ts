import { useAuth } from "@/providers/auth-provider";

export function useRole() {
  const { user } = useAuth();
  return user?.role;
}
