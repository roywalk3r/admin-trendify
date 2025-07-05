"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Save, Trash2 } from "lucide-react"
import { AppwriteUpload } from "@/components/appwrite/appwrite-upload"
import { AppwriteImage } from "@/components/appwrite/appwrite-image"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AppwriteMediaBrowser } from "@/components/appwrite/appwrite-media-browser"

// Hero validation schema
const heroSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().optional(),
    buttonText: z.string().optional(),
    buttonLink: z.string().optional(),
    image: z.string().url("Invalid image URL").optional(),
    color: z.string().optional(),
    isActive: z.boolean().default(true),
})

type HeroFormValues = z.infer<typeof heroSchema>

export default function AdminHeroPage() {
    const [heroContent, setHeroContent] = useState<HeroFormValues[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [selectedHero, setSelectedHero] = useState<HeroFormValues | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const form = useForm<HeroFormValues>({
        resolver: zodResolver(heroSchema),
        defaultValues: {
            title: "",
            description: "",
            buttonText: "",
            buttonLink: "",
            image: "",
            color: "",
            isActive: true,
        },
    })

    useEffect(() => {
        const fetchHeroContent = async () => {
            try {
                setIsLoading(true)
                const response = await fetch("/api/admin/hero")
                if (response.ok) {
                    const data = await response.json()
                    setHeroContent(data.data || [])
                } else {
                    console.error("Failed to fetch hero content")
                }
            } catch (error) {
                console.error("Error fetching hero content:", error)
                toast.error("Failed to fetch hero content")
            } finally {
                setIsLoading(false)
            }
        }

        fetchHeroContent()
    }, [])

    const handleImageUpload = (urls: string[]) => {
        if (urls.length > 0) {
            form.setValue("image", urls[0])
        }
    }

    const handleMediaSelection = (urls: string[]) => {
        if (urls.length > 0) {
            form.setValue("image", urls[0])
        }
    }

    const onSubmit = async (data: HeroFormValues) => {
        setIsSaving(true)
        try {
            const response = await fetch("/api/admin/hero", {
                method: selectedHero ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(selectedHero ? { ...data, id: selectedHero.id } : data),
            })

            if (response.ok) {
                toast.success(`Hero content ${selectedHero ? "updated" : "created"} successfully`)
                setHeroContent((prev) =>
                    selectedHero
                        ? prev.map((item) => (item.id === selectedHero.id ? { ...item, ...data } : item))
                        : [...prev, { ...data, id: Math.random().toString() }],
                )
                form.reset()
                setSelectedHero(null)
            } else {
                toast.error("Failed to save hero content")
            }
        } catch (error) {
            console.error("Error saving hero content:", error)
            toast.error("Error saving hero content")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        setIsSaving(true)
        try {
            const response = await fetch(`/api/admin/hero?id=${selectedHero?.id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                toast.success("Hero content deleted successfully")
                setHeroContent((prev) => prev.filter((item) => item.id !== selectedHero?.id))
                form.reset()
                setSelectedHero(null)
            } else {
                toast.error("Failed to delete hero content")
            }
        } catch (error) {
            console.error("Error deleting hero content:", error)
            toast.error("Error deleting hero content")
        } finally {
            setIsSaving(false)
            setIsDeleteDialogOpen(false)
        }
    }

    return (
        <div className="container py-10">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Manage Hero Section</h1>
                <Button
                    onClick={() => {
                        form.reset()
                        setSelectedHero(null)
                    }}
                >
                    Add Hero
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Hero List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Entries</CardTitle>
                        <CardDescription>View and manage your hero entries.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center min-h-[200px]">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : heroContent.length === 0 ? (
                            <div className="text-center py-8">No hero entries found.</div>
                        ) : (
                            <div className="space-y-2">
                                {heroContent.map((hero) => (
                                    <Button
                                        key={hero.id}
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => setSelectedHero(hero)}
                                    >
                                        {hero.title}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Hero Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>{selectedHero ? "Edit Hero" : "Add Hero"}</CardTitle>
                        <CardDescription>
                            {selectedHero ? "Edit the details of the selected hero." : "Create a new hero entry."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Enter description" className="min-h-[80px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="buttonText"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Button Text</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter button text" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="buttonLink"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Button Link</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter button link" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image</FormLabel>
                                            <FormControl>
                                                <div className="space-y-2">
                                                    <AppwriteUpload
                                                        onUploadSuccess={(urls) => handleImageUpload(urls)}
                                                        buttonText="Upload Image"
                                                        multiple={false}
                                                    />
                                                    <AppwriteMediaBrowser
                                                        onSelect={(urls) => handleImageUpload(urls)}
                                                        buttonText="Select from Media Library"
                                                        multiple={false}
                                                    />
                                                    {field.value && (
                                                        <div className="mt-2">
                                                            <AppwriteImage
                                                                src={field.value}
                                                                alt="Hero image"
                                                                width={200}
                                                                height={200}
                                                                className="rounded-md"
                                                            />
                                                        </div>
                                                    )}
                                                    <Input type="hidden" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end gap-2">
                                    {selectedHero && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => setIsDeleteDialogOpen(true)}
                                            disabled={isSaving}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    )}
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Hero</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this hero entry? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
