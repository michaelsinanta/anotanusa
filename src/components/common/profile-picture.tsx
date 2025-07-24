import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";

type ProfilePictureProps = {
  imageUrl: string | null;
};

export function ProfilePicture({ imageUrl }: ProfilePictureProps) {
  return (
    <Avatar>
      <AvatarImage src={imageUrl ?? undefined} />
      <AvatarFallback>
        <UserRound />
      </AvatarFallback>
    </Avatar>
  );
}
