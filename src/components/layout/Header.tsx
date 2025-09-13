import React from "react";
import { Button } from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Simple avatar fallback (initials)
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return email ? email.charAt(0).toUpperCase() : "?";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Title + Subtitle */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>

          {/* Profile + Actions */}
          <div className="flex items-center space-x-4">
            {/* Avatar + User Info */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {getInitials(profile?.full_name, profile?.email)}
              </div>
              <div className="hidden sm:block text-sm text-gray-700">
                <span className="font-medium">
                  {profile?.full_name || profile?.email}
                </span>
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {profile?.role}
                </span>
              </div>
            </div>

            {/* Sign Out Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
