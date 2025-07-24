"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/hooks/use-role";
import { useRouter } from "next/navigation";

export function RolePicker() {
  const role = useRole();
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
