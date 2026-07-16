"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { DashboardSidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/header";

type Category = { id: string; name: string };
type Subcategory = { id: string; name: string; categoryId: string };
type Product = { id: string; title: string; description?: string | null; imageUrl?: string | null; buttons?: Array<{ label: string; url: string }>|null };

export default function ProductsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
    const [products, setProducts] = useState<Product[]>([]);
    const { data: session } = useSession();

    useEffect(() => {
        const run = async () => {
            const uid = (session?.user as any)?.id;
            if (!uid) return;
            
            // Fetch categories and all products for the user
            const [categoriesRes, productsRes] = await Promise.all([
                fetch(`/api/products/categories?userId=${uid}`),
                fetch(`/api/products?userId=${uid}`)
            ]);
            
            const categoriesData = await categoriesRes.json();
            const productsData = await productsRes.json();
            
            setCategories(categoriesData || []);
            setProducts(productsData || []);
        };
        run();
    }, [session]);

    useEffect(() => {
        const run = async () => {
            const uid = (session?.user as any)?.id;
            if (!uid) return;
            if (!selectedCategoryId) {
                setSubcategories([]);
                setSelectedSubcategoryId("");
                // Reset to show all products
                const res = await fetch(`/api/products?userId=${uid}`);
                const data = await res.json();
                setProducts(data || []);
                return;
            }
            const [subsRes, prodsRes] = await Promise.all([
                fetch(`/api/products/subcategories?userId=${uid}&categoryId=${selectedCategoryId}`),
                fetch(`/api/products?userId=${uid}&categoryId=${selectedCategoryId}`),
            ]);
            const subs = await subsRes.json();
            const prods = await prodsRes.json();
            setSubcategories(subs || []);
            setProducts(prods || []);
        };
        run();
    }, [selectedCategoryId, session]);

    useEffect(() => {
        const run = async () => {
            const uid = (session?.user as any)?.id;
            if (!uid) return;
            if (!selectedSubcategoryId) return;
            const res = await fetch(`/api/products?userId=${uid}&subcategoryId=${selectedSubcategoryId}`);
            const data = await res.json();
            setProducts(data || []);
        };
        run();
    }, [selectedSubcategoryId, session]);

    const filteredSubcategories = useMemo(() => subcategories, [subcategories]);

    return (
        <div className="flex h-screen bg-background">
            <DashboardSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground mb-2">Products / Services</h1>
                                <p className="text-muted-foreground">Manage your catalog by category and subcategory</p>
                            </div>
                            <Button asChild>
                                <Link href="/dashboard/products/new">Add Product</Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select value={selectedCategoryId || "all"} onValueChange={(v) => setSelectedCategoryId(v === "all" ? "" : v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Products</SelectItem>
                                    {categories.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedSubcategoryId || "all"} onValueChange={(v) => setSelectedSubcategoryId(v === "all" ? "" : v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All subcategories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subcategories</SelectItem>
                                    {filteredSubcategories.map(s => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                Products ({products.length})
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.map(p => (
                                <Card key={p.id} className="border-0 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>{p.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {p.imageUrl && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={p.imageUrl} alt={p.title} className="w-full h-40 object-cover rounded" />
                                        )}
                                        {p.description && (<p className="mt-2 text-sm text-muted-foreground">{p.description}</p>)}
                                    </CardContent>
                                    <CardFooter className="gap-2 flex-wrap">
                                        {(Array.isArray(p.buttons) ? p.buttons : [])?.map((b, i) => (
                                            <Button key={i} asChild variant="secondary" size="sm">
                                                <a href={b.url} target="_blank" rel="noreferrer">{b.label}</a>
                                            </Button>
                                        ))}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}


