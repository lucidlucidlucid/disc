"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import type { Playlist } from "@/types/playlist"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ImagePlus, Save } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CreatePlaylistPage() {
  const router = useRouter()
  const [title, setTitle] = useState("Untitled Playlist")
  const [coverImage, setCoverImage] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a URL for the selected image
      const imageUrl = URL.createObjectURL(file)
      setCoverImage(imageUrl)
    }
  }

  const handleSave = () => {
    // Create new playlist
    const newPlaylist: Playlist = {
      id: uuidv4(),
      title: title || "Untitled Playlist",
      coverUrl: coverImage,
      tracks: [],
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage
    const existingPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]")
    localStorage.setItem("playlists", JSON.stringify([...existingPlaylists, newPlaylist]))

    // Navigate to playlist page
    router.push(`/playlist/${newPlaylist.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Create New Playlist</h1>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <Label htmlFor="title" className="block mb-2">
                  Playlist Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                  placeholder="Enter playlist name"
                />
              </div>

              <div>
                <Label className="block mb-2">Cover Image</Label>
                <div className="mt-2">
                  <label htmlFor="cover-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition">
                      <ImagePlus className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload image</p>
                    </div>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <Label className="block mb-2">Preview</Label>
              <div className="relative aspect-square w-full max-w-[250px] mx-auto">
                {/* Outer vinyl ring */}
                <div className="absolute inset-0 rounded-full bg-black shadow-lg"></div>

                {/* Single vinyl groove */}
                <div className="absolute inset-[15%] rounded-full bg-gray-800 opacity-80"></div>

                {/* Center label/album art - now much larger */}
                <div className="absolute inset-[20%] rounded-full overflow-hidden border-4 border-black">
                  {coverImage ? (
                    <Image
                      src={coverImage || "/placeholder.svg"}
                      alt="Playlist cover"
                      fill
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-full">
                      <span className="text-3xl text-gray-500">{title.charAt(0)}</span>
                    </div>
                  )}
                </div>

                {/* Center hole */}
                <div className="absolute inset-[48%] rounded-full bg-black"></div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <Save className="h-4 w-4" />
              <span>Save Playlist</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

