import { Header } from "@/components/layout/header";
import { getAuthenticatedAppForUser } from "@/lib/firebase/server/serverApp";
import { User } from "firebase/auth";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentUser } = await getAuthenticatedAppForUser();
  const initialUser = currentUser?.toJSON() as User;

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr]">
      <Header initialUser={initialUser} />
      {children}
    </div>
  );
}
