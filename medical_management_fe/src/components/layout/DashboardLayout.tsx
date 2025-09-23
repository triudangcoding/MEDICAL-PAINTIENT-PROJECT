import React, { useMemo, useCallback } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/auth/auth.api";
// import { User } from "@/api/auth/types";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Home, Users, Bell, ChevronDown, HelpCircle, LogOut, Loader2 } from "lucide-react";

const adminMenuItems = [
  {
    title: "Tổng quan",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Bác sĩ",
    url: "/dashboard/doctor-management",
    icon: Users,
  },
  {
    title: "Bệnh nhân",
    url: "/dashboard/patients",
    icon: Users,
  },
  {
    title: "Quản lý tài khoản",
    url: "/dashboard/user-management",
    icon: Users,
  },
];

const doctorMenuItems = adminMenuItems;

interface AppSidebarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData: any;
}

// Memoized menu item component for better performance
const MenuItem = React.memo<{
  item: typeof adminMenuItems[0];
  isActive: boolean;
  index: number;
}>(({ item, isActive, index }) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className={cn(
          "relative h-12 px-4 rounded-xl transition-colors duration-200 group overflow-hidden border",
          isActive
            ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
            : "hover:bg-accent/50 text-muted-foreground hover:text-foreground hover:border-accent/20 border-transparent"
        )}
      >
        <Link
          to={item.url}
          className="flex items-center gap-4 relative z-10 w-full"
        >
          <div
            className={cn(
              "flex items-center justify-center w-6 h-6 transition-colors duration-200",
              isActive
                ? "text-primary"
                : "text-muted-foreground/70 group-hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5 stroke-[1.5]" />
          </div>
          <span className="font-medium text-sm tracking-wide flex-1">
            {item.title}
          </span>
          {isActive && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

MenuItem.displayName = "MenuItem";

const AppSidebar: React.FC<AppSidebarProps> = React.memo(({ userData }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Memoize menu items to prevent unnecessary recalculations
  const menuItems = useMemo(() => {
    return userData?.data.role === "DOCTOR" ? doctorMenuItems : adminMenuItems;
  }, [userData?.data.role]);

  // Memoize active path to prevent recalculation on every render
  const activePath = useMemo(() => location.pathname, [location.pathname]);

  // Memoize logout handler
  const handleLogout = useCallback(() => {
    authApi.logout();
    navigate("/");
  }, [navigate]);

  return (
    <Sidebar className="border-r border-border/20 bg-background/95 backdrop-blur-sm">
      {/* Simplified Brand Header */}
      <SidebarHeader className="px-6 py-6 border-b border-border/10">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative group cursor-pointer">
            <div className="relative bg-primary/5 rounded-xl p-3 border border-primary/10">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-white text-lg font-bold transition-transform duration-200 group-hover:scale-105">
                M
              </div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-sm font-semibold text-foreground tracking-wide">Medical Management</h2>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Medical Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6 space-y-8">
        {/* Main Navigation */}
        <SidebarGroup className="space-y-3">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item, index) => (
                <MenuItem
                  key={item.title}
                  item={item}
                  isActive={activePath === item.url}
                  index={index}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Simple Separator */}
        <div className="border-t border-border/20" />
      </SidebarContent>

      <SidebarFooter className="px-4 py-6 border-t border-border/10 space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
            {userData?.data.fullName?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {userData?.data.fullName || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {userData?.data.role === "DOCTOR" ? "Bác sĩ" : 
               userData?.data.role === "ADMIN" ? "Quản trị viên" : "Bệnh nhân"}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-11 justify-start text-muted-foreground hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors duration-200 rounded-xl font-medium"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3 stroke-[1.5]" />
          <span className="text-sm tracking-wide">Đăng xuất</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
});

AppSidebar.displayName = "AppSidebar";

const DashboardLayout: React.FC = () => {
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.getCurrentUser,
  });

  // Preloader component
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              M
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background shadow-sm animate-pulse" />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-xl text-foreground tracking-tight leading-none">
              <span className="text-primary font-extrabold">Medical Management</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error handling
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 h-8 w-8">
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
              <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">Không thể tải dữ liệu người dùng</h2>
          <p className="text-muted-foreground mb-4">Đã xảy ra lỗi khi tải thông tin người dùng. Vui lòng thử lại sau hoặc đăng nhập lại.</p>
          <Button
            variant="default"
            onClick={() => {
              authApi.logout();
              window.location.href = "/";
            }}
          >
            Quay lại trang đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar userData={userData} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Simplified Header */}
          <header className="h-14 border-b border-border/20 bg-background/95 backdrop-blur-sm shadow-sm">
            <div className="h-full flex items-center justify-between px-6">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-9 w-9 hover:bg-accent/50 rounded-xl transition-colors duration-200" />
                <div className="h-6 w-px bg-border/40" />
                <div className="hidden sm:block">
                  <h1 className="text-sm font-semibold text-foreground tracking-wide">
                    Dashboard
                  </h1>
                  <p className="text-xs text-muted-foreground/70">
                    Quản lý hệ thống y tế
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                {/* Quick Actions */}
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-accent/50 rounded-xl transition-colors duration-200 relative group"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-background" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-accent/50 rounded-xl transition-colors duration-200"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>

                <div className="h-6 w-px bg-border/40" />

                {/* User Profile */}
                <div className="flex items-center gap-3 cursor-pointer group hover:bg-accent/30 rounded-xl p-2 transition-colors duration-200">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                      {userData?.data.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background" />
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-sm font-semibold text-foreground leading-tight">
                      {userData?.data.fullName || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground leading-tight">
                      {userData?.data.role === "DOCTOR"
                        ? "Bác sĩ"
                        : userData?.data.role === "ADMIN"
                          ? "Quản trị viên"
                          : "Bệnh nhân"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block group-hover:text-foreground transition-colors duration-200" />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-8 bg-background overflow-auto">
            <div className="min-h-full max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
