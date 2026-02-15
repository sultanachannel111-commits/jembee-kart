"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/providers/cart-provider";
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
import {
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Wand2,
  LogIn,
  User,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, loading } = useAuth();
  const { cart } = useCart(); // ✅ CART ADDED
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push("/");
  };

  const getAvatarFallback = (name: string | undefined) => {
    if (!name) return <User className="h-5 w-5" />;
    const parts = name.split(" ");
    if (parts.length > 1 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || <User className="h-5 w-5" />;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Logo />

        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <>
              {/* ✅ My Orders (Customer) */}
              {user.role === "customer" && (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/orders">
                      <ShoppingBag className="mr-2 h-4 w-4" /> My Orders
                    </Link>
                  </Button>

                  {/* ✅ CART BUTTON */}
                  <Button variant="ghost" asChild className="relative">
                    <Link href="/cart">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Cart
                      {cart.length > 0 && (
                        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {cart.length}
                        </span>
                      )}
                    </Link>
                  </Button>
                </>
              )}

              {/* ✅ USER DROPDOWN */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10 border-2 border-primary/50">
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

                  {(user.role === "admin" ||
                    user.role === "seller") && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {(user.role === "admin" ||
                    user.role === "seller") && (
                    <DropdownMenuItem asChild>
                      <Link href="/product-optimizer">
                        <Wand2 className="mr-2 h-4 w-4" /> Product Optimizer
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Seller / Admin</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/otp-login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Customer Login
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
