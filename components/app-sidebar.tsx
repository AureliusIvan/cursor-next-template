"use client";

import { ChevronDown, Search, Settings } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { sidebarItems } from "./data";

export function AppSidebar() {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          {/* <div className="flex aspect-square size-6 items-center justify-center">
            Logo
          </div> */}
          <div>
            <h2 className="font-semibold">Dalim</h2>
            <p className="text-muted-foreground text-xs">UI Blocks</p>
          </div>
        </div>

        <div className="px-2">
          <div className="relative">
            <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-full rounded-2xl bg-muted py-2 pr-4 pl-9"
              placeholder="Search..."
              type="search"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible
                      onOpenChange={() => toggleExpanded(item.title)}
                      open={expandedItems[item.title]}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            "w-full justify-between rounded-2xl",
                            item.isActive && "bg-primary/10 text-primary"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.badge && (
                              <Badge className="rounded-full px-2 py-0.5 text-xs" variant="outline">
                                {item.badge}
                              </Badge>
                            )}
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                expandedItems[item.title] ? "rotate-180" : ""
                              )}
                            />
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild className="rounded-2xl">
                                <a className="flex items-center justify-between" href={subItem.url}>
                                  {subItem.title}
                                  {subItem.badge && (
                                    <Badge
                                      className="rounded-full px-2 py-0.5 text-xs"
                                      variant="outline"
                                    >
                                      {subItem.badge}
                                    </Badge>
                                  )}
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild className="rounded-2xl" isActive={item.isActive}>
                      <a className="flex items-center justify-between" href={item.url || "#"}>
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <Badge className="rounded-full px-2 py-0.5 text-xs" variant="outline">
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-2xl">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-2xl">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage alt="User" src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <span>Ali Imam</span>
                </div>
                <Badge variant="outline">Pro</Badge>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
