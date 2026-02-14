"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Clipboard, ClipboardCheck } from 'lucide-react';
import { optimizeProductListingAction } from '@/lib/actions';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const schema = z.object({
  currentTitle: z.string().min(1, 'Title is required'),
  currentDescription: z.string().min(1, 'Description is required'),
});

type FormFields = z.infer<typeof schema>;

type OptimizationResult = {
  optimizedTitle: string;
  optimizedDescription: string;
};

export function ProductOptimizerClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'title' | 'description' | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    const response = await optimizeProductListingAction(data);
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setResult(response.data);
    }
    setIsLoading(false);
  };

  const handleCopy = (text: string, field: 'title' | 'description') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="currentTitle" className="font-semibold">Current Product Title</Label>
          <Input id="currentTitle" {...register('currentTitle')} placeholder="e.g., Blue T-Shirt" />
          {errors.currentTitle && <p className="text-sm text-destructive mt-1">{errors.currentTitle.message}</p>}
        </div>
        <div>
          <Label htmlFor="currentDescription" className="font-semibold">Current Product Description</Label>
          <Textarea id="currentDescription" {...register('currentDescription')} placeholder="e.g., A comfortable 100% cotton t-shirt, available in all sizes." rows={5} />
          {errors.currentDescription && <p className="text-sm text-destructive mt-1">{errors.currentDescription.message}</p>}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Optimizing...</>
          ) : (
            <><Wand2 className="mr-2 h-4 w-4" /> Optimize Now</>
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Optimization Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {result && (
        <div className="space-y-6">
          <Separator />
          <h2 className="text-2xl font-semibold font-headline">AI-Powered Suggestions</h2>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Optimized Title</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => handleCopy(result.optimizedTitle, 'title')}>
                {copiedField === 'title' ? <ClipboardCheck className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                <span className="sr-only">Copy title</span>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-medium">{result.optimizedTitle}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Optimized Description</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => handleCopy(result.optimizedDescription, 'description')}>
                {copiedField === 'description' ? <ClipboardCheck className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                <span className="sr-only">Copy description</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: result.optimizedDescription.replace(/\n/g, '<br />') }} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
