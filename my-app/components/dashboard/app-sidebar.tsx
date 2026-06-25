"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

import {
  LayoutDashboard,
  Users,
  Database,
  TrendingUp,
  Lightbulb,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useTheme } from "@/components/Theme/theme-provider";

export function AppSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const isDarkTheme = theme === "dark";

  const mainItems = [
    {
      title: "Overview",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: Users,
    },
  ];

  const dataItems = [
    {
      title: "Datasets",
      url: "/datasets",
      icon: Database,
    },
    {
      title: "Predictions",
      url: "/predictions",
      icon: TrendingUp,
    },
    {
      title: "Recommendations",
      url: "/recommendations",
      icon: Lightbulb,
    },
  ];

  return (
    <Sidebar
      className="border-r border-[#E7DED1] bg-[#F8F4EE] dark:border-border dark:bg-sidebar"
    >
      <SidebarHeader>
        <div className="px-4 py-4">
          <h2 className="text-xl font-bold">
            SignalRetention
          </h2>

          <p className="text-xs text-muted-foreground">
            Customer Intelligence
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* MAIN */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Main
          </SidebarGroupLabel>

          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={
                    pathname === item.url
                      ? "bg-[#E8E4DD] font-medium dark:bg-sidebar-accent"
                      : "hover:bg-[#F1ECE4] dark:hover:bg-sidebar-accent"
                  }
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* DATA */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Data
          </SidebarGroupLabel>

          <SidebarMenu>
            {dataItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={
                    pathname === item.url
                      ? "bg-[#E8E4DD] font-medium dark:bg-sidebar-accent"
                      : "hover:bg-[#F1ECE4] dark:hover:bg-sidebar-accent"
                  }
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* TOOLS */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Tools
          </SidebarGroupLabel>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="hover:bg-[#F1ECE4] dark:hover:bg-sidebar-accent"
                onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
              >
                {isDarkTheme ? <Moon /> : <Sun />}
                <span>Theme</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#E7DED1] dark:border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={
                pathname === "/settings"
                  ? "bg-[#E8E4DD] font-medium dark:bg-sidebar-accent"
                  : "hover:bg-[#F1ECE4] dark:hover:bg-sidebar-accent"
              }
            >
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        <div className="flex items-center gap-3 px-2 py-2">
          <UserButton />

          <div>
            <p className="text-sm font-medium">
              Account
            </p>

            <p className="text-xs text-muted-foreground">
              Signed in
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
