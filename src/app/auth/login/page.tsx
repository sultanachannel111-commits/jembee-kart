import { EmailLoginForm } from "@/components/auth/email-login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import Link from 'next/link';
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "absolute left-4 top-4 md:left-8 md:top-8")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
        </Link>
        <div className="mb-8">
            <Logo />
        </div>
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Seller / Admin Login</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <EmailLoginForm />
            </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
            Are you a customer?{' '}
            <Link href="/auth/otp-login" className="font-semibold text-primary underline-offset-4 hover:underline">
                Login with your phone
            </Link>
        </p>
    </div>
  );
}
