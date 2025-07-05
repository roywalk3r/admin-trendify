"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react'
import { useApi, useApiMutation } from "@/lib/hooks/use-api"

export default function HeroContentPage() {
    const { toast } = useToast()
    const [heroContent, setHeroContent] = useState([])
    const [isCreating, setIsCreating] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedHeroContent, setSelectedHeroContent] = useState(null)

    const { data, isLoading, refetch } = useApi<any>("/api/admin/hero-content")

    const { mutate: createHeroContent, isLoading: isCreatingHeroContent } = useApiMutation(
        "/api/admin/hero-content",
        "POST",
        {
            onSuccess: () => {
                toast({
                    title: "Hero Content Created",
                    description: "New hero content has been successfully created.",
                })
                refetch()
                setIsCreating(false)
            },
            onError: (error) => {
                toast({
                    title: "Error",
                    description: `Failed to create hero content: ${error}`,
                    variant: "destructive",
                })
            },
        },
    )

    const { mutate: updateHeroContent, isLoading: isUpdatingHeroContent } = useApiMutation(
        "/api/admin/hero-content",
        "PATCH",
        {
            onSuccess: () => {
                toast({
                    title: "Hero Content Updated",
                    description: "Hero content has been successfully updated.",
                })
                refetch()
                setIsEditing(false)
            },
            onError: (error) => {
                toast({
                    title: "Error",
                    description: `Failed to update hero content: ${error}`,
                    variant: "destructive",
                })
            },
        },
    )

    const { mutate: deleteHeroContent, isLoading: isDeletingHeroContent } = useApiMutation(
        `/api/admin/hero-content`,
        "DELETE",
        {
            onSuccess: () => {
                toast({
                    title: "Hero Content Deleted",
                    description: "Hero content has been successfully deleted.",
                })
                refetch()
            },
            onError: (error) => {
                toast({
                    title: "Error",
                    description: `Failed to delete hero content: ${error}`,
                    variant: "destructive",
                })
            },
        },
    )

    useEffect(() => {
        if (data?.data) {
            setHeroContent(data.data)
        }
    }, [data])

    return (
        <div className="container py-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Hero Content Management</h1>
                <Button onClick={() => setIsCreating(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {heroContent.map((item:any) => (
                        <Card key={item.id}>
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-48 object-cover rounded-md" />
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {isCreating && (
                <CreateHeroContentModal
                    open={isCreating}
                    onClose={() => setIsCreating(false)}
                    onSubmit={createHeroContent}
                    isLoading={isCreatingHeroContent}
                />
            )}

            {/* Edit Modal */}
            {isEditing && (
                <EditHeroContentModal
                    open={isEditing}
                    onClose={() => setIsEditing(false)}
                    onSubmit={updateHeroContent}
                    isLoading={isUpdatingHeroContent}
                    initialData={selectedHeroContent}
                />
            )}
        </div>
    )

    function handleEdit(item: any) {
        setSelectedHeroContent(item)
        setIsEditing(true)
    }

    function handleDelete(id: any) {
        deleteHeroContent(id)
    }
}

function CreateHeroContentModal({ open, onClose, onSubmit, isLoading }:any) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState("")
    const [buttonText, setButtonText] = useState("")
    const [buttonLink, setButtonLink] = useState("")
    const [color, setColor] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await onSubmit({ title, description, image, buttonText, buttonLink, color })
        onClose()
    }

    return (
        <div className={`fixed inset-0 z-50 ${open ? "" : "hidden"}`}>
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Create Hero Content</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                    </div>
                    <div>
                        <Label htmlFor="image">Image URL</Label>
                        <Input type="url" id="image" value={image} onChange={(e) => setImage(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="buttonText">Button Text</Label>
                        <Input type="text" id="buttonText" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="buttonLink">Button Link</Label>
                        <Input type="url" id="buttonLink" value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="color">Color</Label>
                        <Input type="text" id="color" value={color} onChange={(e) => setColor(e.target.value)} />
                    </div>
                    <div className="flex justify-end">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function EditHeroContentModal({ open, onClose, onSubmit, isLoading, initialData }:any) {
    const [title, setTitle] = useState(initialData?.title || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [image, setImage] = useState(initialData?.image || "")
    const [buttonText, setButtonText] = useState(initialData?.buttonText || "")
    const [buttonLink, setButtonLink] = useState(initialData?.buttonLink || "")
    const [color, setColor] = useState(initialData?.color || "")

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault()
        await onSubmit({ id: initialData.id, title, description, image, buttonText, buttonLink, color })
        onClose()
    }

    return (
        <div className={`fixed inset-0 z-50 ${open ? "" : "hidden"}`}>
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Edit Hero Content</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                    </div>
                    <div>
                        <Label htmlFor="image">Image URL</Label>
                        <Input type="url" id="image" value={image} onChange={(e) => setImage(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="buttonText">Button Text</Label>
                        <Input type="text" id="buttonText" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="buttonLink">Button Link</Label>
                        <Input type="url" id="buttonLink" value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="color">Color</Label>
                        <Input type="text" id="color" value={color} onChange={(e) => setColor(e.target.value)} />
                    </div>
                    <div className="flex justify-end">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
