"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Playlist, Track } from "@/types/playlist"
import { v4 as uuidv4 } from "uuid"
import { ArrowLeft, Edit2, Music, Pause, Play, PlusCircle, Save, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import AudioPlayer from "@/components/audio-player"

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedCover, setEditedCover] = useState<string | null>(null)
  const [isAddTrackOpen, setIsAddTrackOpen] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Add track renaming functionality and improve animations
  // First, add a new state for track renaming
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null)
  const [editedTrackTitle, setEditedTrackTitle] = useState("")

  useEffect(() => {
    // Load playlist from localStorage
    const storedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]")
    const foundPlaylist = storedPlaylists.find((p: Playlist) => p.id === params.id)

    if (foundPlaylist) {
      setPlaylist(foundPlaylist)
      setEditedTitle(foundPlaylist.title)
      setEditedCover(foundPlaylist.coverUrl)
    } else {
      router.push("/")
    }
  }, [params.id, router])

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setEditedCover(imageUrl)
    }
  }

  const handleSaveChanges = () => {
    if (!playlist) return

    const updatedPlaylist = {
      ...playlist,
      title: editedTitle,
      coverUrl: editedCover,
    }

    // Update in localStorage
    const storedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]")
    const updatedPlaylists = storedPlaylists.map((p: Playlist) => (p.id === playlist.id ? updatedPlaylist : p))

    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists))
    setPlaylist(updatedPlaylist)
    setIsEditing(false)
  }

  const handleAddTrack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !playlist) return

    const newTrack: Track = {
      id: uuidv4(),
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      url: URL.createObjectURL(file),
      duration: 0, // This would be calculated from audio metadata in a real app
      addedAt: new Date().toISOString(),
    }

    const updatedPlaylist = {
      ...playlist,
      tracks: [...playlist.tracks, newTrack],
    }

    // Update in localStorage
    const storedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]")
    const updatedPlaylists = storedPlaylists.map((p: Playlist) => (p.id === playlist.id ? updatedPlaylist : p))

    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists))
    setPlaylist(updatedPlaylist)
    setIsAddTrackOpen(false)
  }

  const handleDeleteTrack = (trackId: string) => {
    if (!playlist) return

    const updatedTracks = playlist.tracks.filter((track) => track.id !== trackId)
    const updatedPlaylist = { ...playlist, tracks: updatedTracks }

    // Update in localStorage
    const storedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]")
    const updatedPlaylists = storedPlaylists.map((p: Playlist) => (p.id === playlist.id ? updatedPlaylist : p))

    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists))
    setPlaylist(updatedPlaylist)

    // If current track is deleted, stop playback
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null)
      setIsPlaying(false)
    }
  }

  // Add a function to handle track renaming after the handleDeleteTrack function
  const handleRenameTrack = (trackId: string) => {
    if (!playlist) return

    const track = playlist.tracks.find((t) => t.id === trackId)
    if (track) {
      setEditingTrackId(trackId)
      setEditedTrackTitle(track.title)
    }
  }

  const saveTrackRename = () => {
    if (!playlist || !editingTrackId) return

    const updatedTracks = playlist.tracks.map((track) =>
      track.id === editingTrackId ? { ...track, title: editedTrackTitle || track.title } : track,
    )

    const updatedPlaylist = { ...playlist, tracks: updatedTracks }

    // Update in localStorage
    const storedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]")
    const updatedPlaylists = storedPlaylists.map((p: Playlist) => (p.id === playlist.id ? updatedPlaylist : p))

    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists))
    setPlaylist(updatedPlaylist)
    setEditingTrackId(null)

    // Update current track if it was renamed
    if (currentTrack?.id === editingTrackId) {
      setCurrentTrack({ ...currentTrack, title: editedTrackTitle })
    }
  }

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading playlist...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-28">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-xl font-bold w-auto"
              />
              <Button onClick={handleSaveChanges} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">{playlist.title}</h1>
              <Button onClick={() => setIsEditing(true)} variant="ghost" size="icon" className="ml-2">
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div
              className={`relative aspect-square w-full max-w-[300px] mx-auto ${currentTrack && isPlaying ? "animate-spin-slow" : ""}`}
              style={{ animationDuration: "3s" }}
            >
              {/* Outer vinyl ring */}
              <div className="absolute inset-0 rounded-full bg-black shadow-lg transition-all duration-500 hover:shadow-xl"></div>

              {/* Single vinyl groove */}
              <div className="absolute inset-[15%] rounded-full bg-gray-800 opacity-80"></div>

              {/* Center label/album art - now much larger */}
              <div className="absolute inset-[20%] rounded-full overflow-hidden border-4 border-black">
                {isEditing ? (
                  <div className="relative w-full h-full">
                    {editedCover ? (
                      <Image
                        src={editedCover || "/placeholder.svg"}
                        alt="Playlist cover"
                        fill
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-full">
                        <span className="text-4xl text-gray-500">{editedTitle.charAt(0)}</span>
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-all duration-300 rounded-full cursor-pointer">
                      <div className="text-white text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <span>Change Cover</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                    </label>
                  </div>
                ) : (
                  <>
                    {playlist.coverUrl ? (
                      <Image
                        src={playlist.coverUrl || "/placeholder.svg"}
                        alt={playlist.title}
                        fill
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-full">
                        <span className="text-4xl text-gray-500">{playlist.title.charAt(0)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Center hole */}
              <div className="absolute inset-[48%] rounded-full bg-black"></div>
            </div>

            <div className="text-sm text-gray-500 mb-4 mt-6 text-center">
              {playlist.tracks.length} {playlist.tracks.length === 1 ? "track" : "tracks"}
            </div>

            <Button
              onClick={() => setIsAddTrackOpen(true)}
              className="w-full flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Tracks</span>
            </Button>
          </div>

          <div className="md:col-span-2">
            {playlist.tracks.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center">
                <Music className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No tracks yet</h3>
                <p className="text-gray-500 mb-4">Add some tracks to get started</p>
                <Button onClick={() => setIsAddTrackOpen(true)} className="flex items-center justify-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Tracks</span>
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {playlist.tracks.map((track, index) => (
                  <div key={track.id}>
                    {index > 0 && <Separator />}
                    <div className="flex items-center p-4 hover:bg-gray-50 transition-colors duration-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-4 transition-transform duration-200 hover:scale-110"
                        onClick={() => {
                          if (currentTrack?.id === track.id && isPlaying) {
                            setIsPlaying(false)
                          } else {
                            handlePlayTrack(track)
                          }
                        }}
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>

                      <div className="flex-1 min-w-0">
                        {editingTrackId === track.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editedTrackTitle}
                              onChange={(e) => setEditedTrackTitle(e.target.value)}
                              className="h-8"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveTrackRename()
                                if (e.key === "Escape") setEditingTrackId(null)
                              }}
                            />
                            <Button size="sm" onClick={saveTrackRename}>
                              <Save className="h-3.5 w-3.5 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingTrackId(null)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="font-medium truncate">{track.title}</div>
                        )}
                      </div>

                      <div className="flex gap-1">
                        {editingTrackId !== track.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            onClick={() => handleRenameTrack(track.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                          onClick={() => handleDeleteTrack(track.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed audio player at bottom */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <AudioPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onEnded={() => {
              // Find next track in playlist
              const currentIndex = playlist.tracks.findIndex((t) => t.id === currentTrack.id)
              const nextTrack = playlist.tracks[currentIndex + 1]
              if (nextTrack) {
                setCurrentTrack(nextTrack)
              } else {
                setIsPlaying(false)
              }
            }}
          />
        </div>
      )}

      {/* Add Track Dialog */}
      <Dialog open={isAddTrackOpen} onOpenChange={setIsAddTrackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tracks</DialogTitle>
            <DialogDescription>Select MP3 files to add to your playlist.</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition">
                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-1">Click to select MP3 files</p>
                <p className="text-xs text-gray-400">or drag and drop</p>
              </div>
              <input type="file" accept="audio/mp3,audio/*" className="hidden" onChange={handleAddTrack} />
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTrackOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

