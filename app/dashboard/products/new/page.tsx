"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { DashboardSidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/header";
import { Plus, ChevronRight, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const schema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    imageUrl: z.string().url("Invalid URL"),
    categoryId: z.string().uuid({ message: "Select a category" }),
    subcategoryId: z.string().uuid({ message: "Select a subcategory" }),
    buttonLabel: z.string().min(1, "Button label is required"),
    buttonUrl: z.string().url("Invalid URL"),
    active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

// SubcategoryTree Component
function SubcategoryTree({ 
    tree, 
    selectedPath, 
    onPathChange, 
    onSubcategorySelect, 
    selectedSubcategoryId, 
    categoryId, 
    userId, 
    onSubcategoryAdded 
}: {
    tree: any[];
    selectedPath: string[];
    onPathChange: (path: string[]) => void;
    onSubcategorySelect: (id: string) => void;
    selectedSubcategoryId: string;
    categoryId: string;
    userId: string;
    onSubcategoryAdded: () => void;
}) {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [addingToParent, setAddingToParent] = useState<string | null>(null);
    const [newSubcategoryName, setNewSubcategoryName] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const toggleExpanded = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const addSubcategory = async (parentId: string | null) => {
        if (!newSubcategoryName.trim()) {
            toast.error("Please enter a subcategory name");
            return;
        }
        
        if (!userId) {
            toast.error("Not authenticated");
            return;
        }
        
        if (!categoryId) {
            toast.error("Please select a category first");
            return;
        }
        
        setIsAdding(true);
        
        try {
            console.log("Adding subcategory:", { name: newSubcategoryName.trim(), categoryId, parentId, userId });
            
            const res = await fetch("/api/products/subcategories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    name: newSubcategoryName.trim(), 
                    categoryId, 
                    parentId, 
                    userId 
                })
            });
            
            console.log("Response status:", res.status);
            
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error("API Error:", err);
                throw new Error(err?.error ? JSON.stringify(err.error) : `Failed to add subcategory: ${res.status}`);
            }
            
            const created = await res.json();
            console.log("Created subcategory:", created);
            
            setNewSubcategoryName("");
            setAddingToParent(null);
            onSubcategoryAdded();
            toast.success("Subcategory added");
        } catch (e: any) {
            console.error("Error adding subcategory:", e);
            toast.error(e?.message || "Something went wrong");
        } finally {
            setIsAdding(false);
        }
    };

    const renderNode = (node: any, level: number = 0) => {
        const isExpanded = expandedNodes.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const isSelected = selectedSubcategoryId === node.id;

        return (
            <div key={node.id} className="ml-4">
                <div className="flex items-center gap-2 py-1">
                    {hasChildren && (
                        <button
                            onClick={() => toggleExpanded(node.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    )}
                    {!hasChildren && <div className="w-6" />}
                    
                    <button
                        onClick={() => onSubcategorySelect(node.id)}
                        className={`flex-1 text-left px-2 py-1 rounded ${
                            isSelected ? "bg-blue-100 text-blue-800" : "hover:bg-gray-50"
                        }`}
                    >
                        {node.name}
                    </button>
                    
                    <button
                        onClick={() => setAddingToParent(node.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Add subcategory"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {addingToParent === node.id && (
                    <div className="ml-8 flex items-center gap-2 py-2">
                        <Input
                            placeholder="New subcategory name"
                            value={newSubcategoryName}
                            onChange={(e) => setNewSubcategoryName(e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            size="sm"
                            onClick={() => addSubcategory(node.id)}
                            disabled={!newSubcategoryName.trim() || isAdding}
                        >
                            {isAdding ? "Adding..." : "Add"}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setAddingToParent(null);
                                setNewSubcategoryName("");
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                )}

                {isExpanded && hasChildren && (
                    <div>
                        {node.children.map((child: any) => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setAddingToParent("ROOT")}
                    className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600 hover:text-gray-800"
                >
                    <Plus className="w-4 h-4" />
                    Add Root Subcategory
                </button>
            </div>

            {addingToParent === "ROOT" && (
                <div className="flex items-center gap-2 py-2">
                    <Input
                        placeholder="New subcategory name"
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        size="sm"
                        onClick={() => addSubcategory(null)}
                        disabled={!newSubcategoryName.trim() || isAdding}
                    >
                        {isAdding ? "Adding..." : "Add"}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setAddingToParent(null);
                            setNewSubcategoryName("");
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {tree.map((node: any) => renderNode(node))}
        </div>
    );
}

export default function NewProductPage() {
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
    const [subcategories, setSubcategories] = useState<Array<{ id: string; name: string; categoryId: string; parentId?: string | null }>>([]);
    const [subcategoryTree, setSubcategoryTree] = useState<Array<{ id: string; name: string; categoryId: string; parentId?: string | null; children?: any[] }>>([]);
    const [selectedSubcategoryPath, setSelectedSubcategoryPath] = useState<string[]>([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [addingCategory, setAddingCategory] = useState(false);
    const [newSubcategoryName, setNewSubcategoryName] = useState("");
    const [addingSubcategory, setAddingSubcategory] = useState(false);
    const { data: session, status } = useSession();

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { title: "", description: "", imageUrl: "", categoryId: "", subcategoryId: "", buttonLabel: "", buttonUrl: "", active: true },
        mode: "onChange"
    });

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = form;

    const selectedCategoryId = watch("categoryId") as string;
    const currentTitle = watch("title");
    const currentDescription = watch("description");
    const currentImageUrl = watch("imageUrl");
    const currentButtonLabel = watch("buttonLabel");
    const currentButtonUrl = watch("buttonUrl");

    const [titleValue, setTitleValue] = useState("");
    const [descriptionValue, setDescriptionValue] = useState("");
    const [imageUrlValue, setImageUrlValue] = useState("");
    const [buttonLabelValue, setButtonLabelValue] = useState("");
    const [buttonUrlValue, setButtonUrlValue] = useState("");
    
    // Debug: log current form values (remove in production)
    // useEffect(() => {
    //     console.log("Current title value:", currentTitle);
    //     console.log("Form values:", form.getValues());
    //     console.log("Form state:", form.formState);
    // }, [currentTitle, form.formState]);

    // Sync local state with form state
    useEffect(() => {
        if (currentTitle !== titleValue) {
            setTitleValue(currentTitle || "");
        }
    }, [currentTitle, titleValue]);

    useEffect(() => {
        if (currentDescription !== descriptionValue) {
            setDescriptionValue(currentDescription || "");
        }
    }, [currentDescription, descriptionValue]);

    useEffect(() => {
        if (currentImageUrl !== imageUrlValue) {
            setImageUrlValue(currentImageUrl || "");
        }
    }, [currentImageUrl, imageUrlValue]);

    useEffect(() => {
        if (currentButtonLabel !== buttonLabelValue) {
            setButtonLabelValue(currentButtonLabel || "");
        }
    }, [currentButtonLabel, buttonLabelValue]);

    useEffect(() => {
        if (currentButtonUrl !== buttonUrlValue) {
            setButtonUrlValue(currentButtonUrl || "");
        }
    }, [currentButtonUrl, buttonUrlValue]);

    // Build tree structure from flat subcategories
    const buildTree = (items: any[], parentId: string | null = null): any[] => {
        return items
            .filter((item: any) => {
                // Handle both null and undefined cases for parentId
                const itemParentId = item.parentId === null ? null : item.parentId;
                return itemParentId === parentId;
            })
            .map((item: any) => ({
                ...item,
                children: buildTree(items, item.id)
            }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
    };

    useEffect(() => {
        const run = async () => {
            const res = await fetch(`/api/products/categories`);
            const data = await res.json();
            setCategories(data || []);
        };
        run();
    }, [session]);

    useEffect(() => {
        const run = async () => {
            if (!selectedCategoryId) {
                setSubcategories([]);
                setSubcategoryTree([]);
                setSelectedSubcategoryPath([]);
                form.setValue("subcategoryId", "");
                return;
            }
            const res = await fetch(`/api/products/subcategories?categoryId=${selectedCategoryId}`);
            const data = await res.json();
            setSubcategories(data || []);
            setSubcategoryTree(buildTree(data || []));
        };
        run();
    }, [selectedCategoryId, session, form]);

    const onSubmit = async (values: FormValues) => {
        try {
            console.log("Session status:", status);
            console.log("Session:", session);
            console.log("Session user:", session?.user);
            const uid = (session?.user as any)?.id;
            console.log("User ID:", uid);
            
            if (status === "loading") {
                toast.error("Please wait, session is loading...");
                return;
            }
            
            if (!uid) {
                toast.error("Not authenticated - please log in again");
                return;
            }
            const payload: any = {
                title: values.title,
                description: values.description,
                imageUrl: values.imageUrl,
                categoryId: values.categoryId,
                subcategoryId: values.subcategoryId,
                buttons: [{ label: values.buttonLabel, url: values.buttonUrl }],
                active: values.active,
            };
            
            console.log("Payload being sent:", payload);
            console.log("Payload JSON:", JSON.stringify(payload));
            
            const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            
            console.log("Response status:", res.status);
            console.log("Response headers:", res.headers);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.log("API Error response:", err);
                throw new Error(err?.error ? JSON.stringify(err.error) : "Failed to create product");
            }
            toast.success("Product created");
        } catch (e: any) {
            toast.error(e?.message || "Something went wrong");
        }
    };

    return (
        <div className="flex h-screen bg-background">
            <DashboardSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Add Product / Service</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input 
                            id="title" 
                            placeholder="Product title" 
                            value={titleValue}
                            onChange={(e) => {
                                setTitleValue(e.target.value);
                                form.setValue("title", e.target.value);
                            }}
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                            id="description" 
                            placeholder="Describe your product" 
                            value={descriptionValue}
                            onChange={(e) => {
                                setDescriptionValue(e.target.value);
                                form.setValue("description", e.target.value, { shouldValidate: true });
                            }}
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input 
                            id="imageUrl" 
                            placeholder="https://..." 
                            value={imageUrlValue}
                            onChange={(e) => {
                                setImageUrlValue(e.target.value);
                                form.setValue("imageUrl", e.target.value, { shouldValidate: true });
                            }}
                        />
                        {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
                    </div>
                    <div className="space-y-2">
                            <Label>Category</Label>
                            <Select onValueChange={(v) => form.setValue("categoryId", v, { shouldValidate: true })} value={selectedCategoryId || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message as any}</p>}
                            <div className="mt-2 flex items-center gap-2">
                                <Input
                                    placeholder="New category name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={!newCategoryName.trim() || addingCategory}
                                    onClick={async () => {
                                        try {
                                            setAddingCategory(true);
                                            const res = await fetch("/api/products/categories", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ name: newCategoryName.trim() })
                                            });
                                            if (!res.ok) {
                                                const err = await res.json().catch(() => ({}));
                                                throw new Error(err?.error ? JSON.stringify(err.error) : "Failed to add category");
                                            }
                                            const created = await res.json();
                                            setCategories((prev: Array<{ id: string; name: string }>) => [...prev, created].sort((a: any, b: any) => a.name.localeCompare(b.name)));
                                            form.setValue("categoryId", created.id);
                                            setNewCategoryName("");
                                            toast.success("Category added");
                                        } catch (e: any) {
                                            toast.error(e?.message || "Something went wrong");
                                        } finally {
                                            setAddingCategory(false);
                                        }
                                    }}
                                >
                                    {addingCategory ? "Adding..." : "Add"}
                                </Button>
                            </div>
                    </div>
                    <div className="space-y-2 mt-4">
                        <Label>Subcategories</Label>
                        {selectedCategoryId && (
                            <div className="border rounded-lg p-4 space-y-3">
                                <SubcategoryTree
                                    tree={subcategoryTree}
                                    selectedPath={selectedSubcategoryPath}
                                    onPathChange={setSelectedSubcategoryPath}
                                    onSubcategorySelect={(id) => form.setValue("subcategoryId", id, { shouldValidate: true })}
                                    selectedSubcategoryId={watch("subcategoryId") as string}
                                    categoryId={selectedCategoryId}
                                    userId={(session?.user as any)?.id}
                                    onSubcategoryAdded={() => {
                                        // Refresh subcategories after adding
                                        const run = async () => {
                                            if (!selectedCategoryId) return;
                                            const res = await fetch(`/api/products/subcategories?categoryId=${selectedCategoryId}`);
                                            const data = await res.json();
                                            setSubcategories(data || []);
                                            setSubcategoryTree(buildTree(data || []));
                                        };
                                        run();
                                    }}
                                />
                                {errors.subcategoryId && <p className="text-sm text-red-500">{errors.subcategoryId.message as any}</p>}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Button label</Label>
                            <Input 
                                placeholder="Buy now" 
                                value={buttonLabelValue}
                                onChange={(e) => {
                                    setButtonLabelValue(e.target.value);
                                    form.setValue("buttonLabel", e.target.value, { shouldValidate: true });
                                }}
                            />
                            {errors.buttonLabel && <p className="text-sm text-red-500">{errors.buttonLabel.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Button URL</Label>
                            <Input 
                                placeholder="https://checkout..." 
                                value={buttonUrlValue}
                                onChange={(e) => {
                                    setButtonUrlValue(e.target.value);
                                    form.setValue("buttonUrl", e.target.value, { shouldValidate: true });
                                }}
                            />
                            {errors.buttonUrl && <p className="text-sm text-red-500">{errors.buttonUrl.message}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <Switch checked={watch("active") as boolean} onCheckedChange={(v) => form.setValue("active", v, { shouldValidate: true })} />
                        <Label className="!mb-0">Active</Label>
                    </div>
                                </form>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" form="product-form" disabled={isSubmitting}>Add Product</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}


