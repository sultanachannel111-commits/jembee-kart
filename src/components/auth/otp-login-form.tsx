"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const phoneSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number including country code (e.g., +91 9876543210)."),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits."),
});

const nameSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
});

type Step = 'phone' | 'otp' | 'name' | 'loading';

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
    }
}

export function OtpLoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({ resolver: zodResolver(phoneSchema), defaultValues: { phone: "+91" } });
  const otpForm = useForm<z.infer<typeof otpSchema>>({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });
  const nameForm = useForm<z.infer<typeof nameSchema>>({ resolver: zodResolver(nameSchema), defaultValues: { name: "" } });

  useEffect(() => {
    if (!auth) return;
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': () => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
    }
  }, []);

  async function onPhoneSubmit(values: z.infer<typeof phoneSchema>) {
    setStep('loading');
    if (!auth) {
        toast({ variant: "destructive", title: "Firebase not configured" });
        setStep('phone');
        return;
    }
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, values.phone, appVerifier);
      setConfirmationResult(result);
      setPhoneNumber(values.phone);
      setStep('otp');
      toast({ title: "OTP Sent", description: "An OTP has been sent to your mobile number." });
    } catch (error: any) {
      console.error("SMS not sent", error);
      toast({ variant: "destructive", title: "Failed to send OTP", description: error.message });
      setStep('phone');
    }
  }

  async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
    if (!confirmationResult || !db) return;
    setStep('loading');
    try {
      const result = await confirmationResult.confirm(values.otp);
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push('/');
      } else {
        setStep('name');
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Invalid OTP", description: "The OTP you entered is incorrect. Please try again." });
      setStep('otp');
    }
  }

  async function onNameSubmit(values: z.infer<typeof nameSchema>) {
    if (!auth?.currentUser || !db) return;
    setStep('loading');
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        name: values.name,
        phone: phoneNumber,
        role: "customer",
        createdAt: serverTimestamp(),
      });
      toast({ title: "Profile Created", description: "Welcome to Jembee Kart!" });
      router.push('/');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to create profile", description: error.message });
      setStep('name');
    }
  }

  const renderStep = () => {
    switch(step) {
      case 'phone':
        return (
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              <FormField control={phoneForm.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+91 9876543210" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" className="w-full">Send OTP</Button>
            </form>
          </Form>
        );
      case 'otp':
        return (
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6 flex flex-col items-center">
              <FormField control={otpForm.control} name="otp" render={({ field }) => (
                <FormItem>
                  <FormLabel>One-Time Password</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPGroup>
                        <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription>
                    Enter the 6-digit code sent to your phone.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full">Verify OTP</Button>
            </form>
          </Form>
        );
      case 'name':
        return (
          <Form {...nameForm}>
            <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">One last step! What should we call you?</p>
              <FormField control={nameForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" className="w-full">Complete Profile</Button>
            </form>
          </Form>
        );
      case 'loading':
        return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
  }

  return (
    <div>
      {renderStep()}
      <div id="recaptcha-container" className="mt-4"></div>
    </div>
  );
}
