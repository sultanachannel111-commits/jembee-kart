"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/firebase";
import { LogOut, LogIn, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push("/");
  };

  const getAvatarFallback = (name: string | undefined) => {
    if (!name) return <User className="h-5 w-5" />;
    return name[0]?.toUpperCase() || "U";
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#2874f0] shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 text-white">
        {/* Logo */}
        <Logo />

        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="h-10 w-24 animate-pulse rounded-md bg-blue-400" />
          ) : user ? (
            <>
              {/* Track Order Button */}
              <Button
                variant="secondary"
                onClick={() => router.push("/orders")}
                className="bg-white text-[#2874f0] hover:bg-gray-100"
              >
                Track Order
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full text-white"
                  >
                    <Avatar className="h-10 w-10 border-2 border-white/50">
                      <AvatarImage
                        src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {getAvatarFallback(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-56"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email || user.phone}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild className="bg-white text-[#2874f0]">
              <Link href="/auth/otp-login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
