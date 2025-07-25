import { usePathname } from "next/navigation";

export function useRole() {
  const pathname = usePathname();
  const role = pathname.split("/")[1];
  return role;
}
