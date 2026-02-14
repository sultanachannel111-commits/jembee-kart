import { Header } from "@/components/header";
import { ProductOptimizerClient } from "@/components/product-optimizer-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function ProductOptimizerPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 py-8 md:py-12">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Lightbulb className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold font-headline">Product Listing Optimizer</h1>
                                <p className="text-muted-foreground">
                                    Use AI to enhance your titles and descriptions for better discoverability.
                                </p>
                            </div>
                        </div>

                        <Card className="shadow-lg">
                            <CardContent className="p-6 md:p-8">
                                <ProductOptimizerClient />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
