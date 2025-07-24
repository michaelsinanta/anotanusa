"use client";

import { NavMain } from "@/components/navigations/nav-main";
import { NavUser } from "@/components/navigations/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import useUserSession from "@/hooks/firebase/useUserSession";
import { User } from "firebase/auth";
import { Folder } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useRole } from "@/hooks/use-role";

type SidebarProps = {
  initialUser: User;
};

const creatorData = {
  navMain: [
    {
      title: "Your Projects",
      url: "#",
      icon: Folder,
    },
  ],
};

const annotatorData = {
  navMain: [
    {
      title: "All Annotations",
      url: "#",
      icon: Folder,
    },
    {
      title: "Your Annotations",
      url: "#",
      icon: Folder,
    },
  ],
};

export function AppSidebar({
  initialUser,
  ...props
}: SidebarProps & React.ComponentProps<typeof Sidebar>) {
  const user = useUserSession(initialUser);
  const role = useRole();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="gap-1 data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="#" className="flex items-center">
                <Image src="/logo.svg" alt="Logo" width={36} height={36} />
                <span className="text-2xl font-bold">AnotaNusa</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={
            role == "creator" ? creatorData.navMain : annotatorData.navMain
          }
          quickCreate={role == "creator"}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
