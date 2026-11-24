"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LogOut,
    LayoutDashboard,
    FileText,
    MessageSquare,
    Boxes,
    Mail,
    Sparkles,
    Server,
    PanelLeftClose,
    PanelLeftOpen
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

interface NavItem {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
}

interface NavSection {
    label: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        label: "Overview",
        items: [
            {
                title: "Dashboard",
                url: "/flutterflirt-admin-login/dashboard",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        label: "Content & Catalog",
        items: [
            {
                title: "Blog Management",
                url: "/flutterflirt-admin-login/blogs",
                icon: FileText,
            },
            {
                title: "Product Management",
                url: "/flutterflirt-admin-login/products",
                icon: Boxes,
            },
        ],
    },
    {
        label: "Query Management",
        items: [
            {
                title: "Contact Form",
                url: "/flutterflirt-admin-login/queries",
                icon: Mail,
            },
            {
                title: "ERP Demo Requests",
                url: "/flutterflirt-admin-login/demo-requests",
                icon: Sparkles,
            },
        ],
    },

];

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { toggleSidebar, state, isMobile, openMobile } = useSidebar();

    const isCollapsed = isMobile ? !openMobile : state === "collapsed";

    const handleLogout = () => {
        sessionStorage.removeItem("flutterflirt_admin_token");
        router.push("/flutterflirt-admin-login");
    };

    return (
        <>
            {/* Floating button when sidebar is collapsed */}
            {isCollapsed && (
                <button
                    onClick={toggleSidebar}
                    aria-label="Open Sidebar"
                    className="fixed left-3 top-3 z-40 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#2563eb] shadow-md border border-[#cbe0fb] hover:bg-[#eff6ff] hover:scale-105 active:scale-95 transition-all duration-200"
                >
                    <PanelLeftOpen className="h-4 w-4" />
                </button>
            )}

            <Sidebar className="border-none bg-white">
                <SidebarHeader className="px-5 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#2563eb] text-white font-black text-sm shadow-xs">
                                FF
                            </div>
                            <div>
                                <span className="font-bold text-base text-[#142845] tracking-tight block">Flutterflirt</span>
                                <span className="text-[11px] font-semibold text-[#617b9b] uppercase tracking-wider block">Admin Panel</span>
                            </div>
                        </div>

                        {/* Collapse button on the sidebar header */}
                        <button
                            onClick={toggleSidebar}
                            title="Collapse Sidebar"
                            aria-label="Collapse Sidebar"
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#617b9b] hover:bg-[#edf5ff] hover:text-[#2563eb] transition"
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </button>
                    </div>
                </SidebarHeader>

                <SidebarContent className="px-3">
                    {navSections.map((section) => (
                        <SidebarGroup key={section.label} className="py-2">
                            <SidebarGroupLabel className="text-[11px] font-bold text-[#8ba2bd] uppercase tracking-wider px-3 mb-1.5">
                                {section.label}
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.url || (item.url !== "/flutterflirt-admin-login/dashboard" && pathname?.startsWith(item.url));
                                        return (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton
                                                    render={<Link href={item.url} />}
                                                    isActive={isActive}
                                                    className={`rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all flex items-center justify-between ${isActive
                                                            ? "bg-[#edf5ff] text-[#2563eb] font-bold shadow-xs"
                                                            : "text-[#4a6382] hover:bg-[#f8fbff] hover:text-[#142845]"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#2563eb]" : "text-[#8ba2bd]"}`} />
                                                        <span>{item.title}</span>
                                                    </div>
                                                    {item.badge && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))}
                </SidebarContent>

                <SidebarFooter className="p-4">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={handleLogout}
                                className="rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#dc2626] hover:bg-[#fef2f2] hover:text-[#b91c1c] transition"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sign Out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
        </>
    )
}