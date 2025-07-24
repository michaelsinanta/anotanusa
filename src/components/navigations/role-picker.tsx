"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";

export function RolePicker() {
  const pathname = usePathname();
  const role = pathname.replace(/^\/+/, "");
  const router = useRouter();

  const handleValueChange = (value: string) => {
    router.push(`/${value}`);
  };

  return (
    <Select defaultValue={role} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="annotator">Annotator</SelectItem>
        <SelectItem value="creator">Creator</SelectItem>
      </SelectContent>
    </Select>
  );
}
