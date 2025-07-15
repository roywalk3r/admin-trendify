"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { MediaManager } from "@/components/media/media-manager"
import { toast } from "sonner"
import { ImageIcon, Plus, X } from "lucide-react"

interface HeroSlide {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  buttonText: string
  buttonUrl: string
  isActive: boolean
  order: number
}

export default function HeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadHeroSlides()
  }, [])

  const loadHeroSlides = async () => {
    try {
      setIsLoading(true)
      // Load hero slides from API
      const response = await fetch("/api/admin/hero")
      if (response.ok) {
        const data = await response.json()
        setSlides(data.slides || [])
      }
    } catch (error) {
      toast.error("Failed to load hero slides")
      console.error("Error loading hero slides:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveHeroSlides = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/hero", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slides }),
      })

      if (response.ok) {
        toast.success("Hero slides saved successfully")
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      toast.error("Failed to save hero slides")
      console.error("Error saving hero slides:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addNewSlide = () => {
    const newSlide: HeroSlide = {
      id: Math.random().toString(36).substr(2, 9),
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      buttonText: "Learn More",
      buttonUrl: "#",
      isActive: true,
      order: slides.length,
    }
    setSlides([...slides, newSlide])
    setEditingSlide(newSlide)
  }

  const updateSlide = (slideId: string, updates: Partial<HeroSlide>) => {
    setSlides(slides.map((slide) => (slide.id === slideId ? { ...slide, ...updates } : slide)))
  }

  const removeSlide = (slideId: string) => {
    setSlides(slides.filter((slide) => slide.id !== slideId))
    if (editingSlide?.id === slideId) {
      setEditingSlide(null)
    }
  }

  const handleMediaSelect = (files: any[]) => {
    if (files.length > 0 && editingSlide) {
      updateSlide(editingSlide.id, { imageUrl: files[0].url })
    }
  }

  const moveSlide = (slideId: string, direction: "up" | "down") => {
    const slideIndex = slides.findIndex((s) => s.id === slideId)
    if (slideIndex === -1) return

    const newSlides = [...slides]
    const targetIndex = direction === "up" ? slideIndex - 1 : slideIndex + 1

    if (targetIndex >= 0 && targetIndex < slides.length) {
      ;[newSlides[slideIndex], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[slideIndex]]

      // Update order values
      newSlides.forEach((slide, index) => {
        slide.order = index
      })

      setSlides(newSlides)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hero Section</h1>
          <p className="text-muted-foreground">Manage your homepage hero carousel slides</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addNewSlide} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Add Slide
          </Button>
          <Button onClick={saveHeroSlides} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Slides List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Slides ({slides.length})</CardTitle>
              <CardDescription>Click on a slide to edit its content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {slides.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No slides created yet</p>
                  <p className="text-sm">Click "Add Slide" to get started</p>
                </div>
              ) : (
                slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      editingSlide?.id === slide.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setEditingSlide(slide)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          {slide.isActive ? (
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium truncate">{slide.title || "Untitled Slide"}</p>
                        <p className="text-sm text-muted-foreground truncate">{slide.subtitle || "No subtitle"}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveSlide(slide.id, "up")
                          }}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveSlide(slide.id, "down")
                          }}
                          disabled={index === slides.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          ↓
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeSlide(slide.id)
                          }}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {slide.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={slide.imageUrl || "/placeholder.svg"}
                          alt={slide.title}
                          className="w-full h-20 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Slide Editor */}
        <div className="lg:col-span-2">
          {editingSlide ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Slide</CardTitle>
                <CardDescription>Configure the content and appearance of your hero slide</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Settings */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="active">Active</Label>
                    <p className="text-sm text-muted-foreground">Show this slide in the carousel</p>
                  </div>
                  <Switch
                    id="active"
                    checked={editingSlide.isActive}
                    onCheckedChange={(checked) => updateSlide(editingSlide.id, { isActive: checked })}
                  />
                </div>

                {/* Content Fields */}
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editingSlide.title}
                      onChange={(e) => updateSlide(editingSlide.id, { title: e.target.value })}
                      placeholder="Enter slide title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={editingSlide.subtitle}
                      onChange={(e) => updateSlide(editingSlide.id, { subtitle: e.target.value })}
                      placeholder="Enter slide subtitle"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editingSlide.description}
                      onChange={(e) => updateSlide(editingSlide.id, { description: e.target.value })}
                      placeholder="Enter slide description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buttonText">Button Text</Label>
                      <Input
                        id="buttonText"
                        value={editingSlide.buttonText}
                        onChange={(e) => updateSlide(editingSlide.id, { buttonText: e.target.value })}
                        placeholder="Button text"
                      />
                    </div>
                    <div>
                      <Label htmlFor="buttonUrl">Button URL</Label>
                      <Input
                        id="buttonUrl"
                        value={editingSlide.buttonUrl}
                        onChange={(e) => updateSlide(editingSlide.id, { buttonUrl: e.target.value })}
                        placeholder="Button URL"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                <div>
                  <Label>Background Image</Label>
                  <div className="mt-2">
                    {editingSlide.imageUrl ? (
                      <div className="relative">
                        <img
                          src={editingSlide.imageUrl || "/placeholder.svg"}
                          alt="Hero slide background"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Button variant="secondary" onClick={() => setIsMediaManagerOpen(true)}>
                            Change Image
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => setIsMediaManagerOpen(true)}
                      >
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Click to select an image</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <Label>Preview</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-muted/20">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{editingSlide.title || "Slide Title"}</h3>
                      <p className="text-muted-foreground">{editingSlide.subtitle || "Slide Subtitle"}</p>
                      <p className="text-sm">{editingSlide.description || "Slide description will appear here..."}</p>
                      <Button size="sm" variant="outline">
                        {editingSlide.buttonText || "Button Text"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No slide selected</p>
                  <p>Select a slide from the list to edit its content</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Media Manager */}
      <MediaManager
        isOpen={isMediaManagerOpen}
        onClose={() => setIsMediaManagerOpen(false)}
        onSelect={handleMediaSelect}
        selectionMode="single"
        title="Select Hero Image"
      />
    </div>
  )
}
