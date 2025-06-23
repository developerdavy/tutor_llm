import { Button } from "@/components/ui/button";
import { GraduationCap, Bell, User, LogOut, LayoutDashboard, BookOpen, TrendingUp, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Subjects", href: "/subjects", icon: BookOpen },
    { name: "Progress", href: "/progress", icon: TrendingUp },
    { name: "History", href: "/history", icon: History },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <a className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-edu-blue rounded-lg flex items-center justify-center">
                    <GraduationCap className="text-white text-xl" />
                  </div>
                  <h1 className="text-2xl font-bold text-edu-blue">AI Tutor</h1>
                </a>
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <span 
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        isActive(item.href)
                          ? "text-edu-blue bg-blue-50"
                          : "text-dark-text hover:text-edu-blue hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-edu-blue rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user?.fullName || user?.username}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="px-4 py-2">
          <div className="flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <span 
                    className={`flex items-center justify-center p-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      isActive(item.href)
                        ? "text-edu-blue bg-blue-50"
                        : "text-dark-text hover:text-edu-blue hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}