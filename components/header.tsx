"use client";
import React, { useState, useEffect } from "react";
import { HeaderLogo } from "./headerLogo";
import { Navigation } from "./navigation";
import { LogOut, User } from "lucide-react";
import { WelcomeMsg } from "./welcomeMsg";
import { useRouter } from "next/navigation";

export const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user token exists in localStorage
    const userToken = localStorage.getItem("finance-user_id");
    setIsLoggedIn(!!userToken);
  }, []);

  const handleLogout = () => {
    // Remove user token from localStorage
    localStorage.removeItem("finance-user_id");

    // Optional: Remove any other user-related data
    localStorage.removeItem("finance-token");

    // Update login state
    setIsLoggedIn(false);

    // Redirect to login page
    router.push("/sign-in");
  };

  // If not logged in, don't render the avatar
  if (!isLoggedIn) return null;

  return (
    <header className="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-10 lg:px-14 pb-46">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-14">
          <div className="flex items-center lg:gap-x-16">
            <HeaderLogo />
            <Navigation />
          </div>
          <div className="relative">
            {/* User Avatar */}
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="cursor-pointer"
            >
              <User className="rounded-full bg-white/20 text-white size-8 p-2 hover:bg-white/30 transition" />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 transition"
                >
                  <LogOut className="mr-2 size-5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <WelcomeMsg />
      </div>
    </header>
  );
};

export default Header;
