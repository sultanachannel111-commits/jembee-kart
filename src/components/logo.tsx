import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-xl font-bold text-primary transition-transform hover:scale-105", className)}>
      <div className='p-1.5 bg-primary/10 rounded-lg'>
         <ShoppingCart className="h-6 w-6 text-primary" />
      </div>
      <span className="font-headline">Jembee Kart</span>
    </Link>
  );
}
