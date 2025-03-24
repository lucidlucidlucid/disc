"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Playlist } from "@/types/playlist"
import Image from "next/image"

export default function PlaylistGrid() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  useEffect(() => {
    // Load playlists from localStorage
    const storedPlaylists = localStorage.getItem("playlists")
    if (storedPlaylists) {
      setPlaylists(JSON.parse(storedPlaylists))
    }
  }, [])

  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-600 mb-4">You haven't created any playlists yet</p>
        <Link href="/create-playlist">
          <button className="px-4 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition">
            Create your first playlist
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {playlists.map((playlist) => (
        <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
          <div className="group relative flex flex-col items-center transition-all duration-300 hover:scale-105">
            {/* Vinyl disc with larger cover */}
            <div className="relative aspect-square w-full max-w-[250px]">
              {/* Outer vinyl ring */}
              <div className="absolute inset-0 rounded-full bg-black shadow-lg transition-all duration-500 group-hover:shadow-xl"></div>

              {/* Single vinyl groove */}
              <div className="absolute inset-[15%] rounded-full bg-gray-800 opacity-80"></div>

              {/* Center label/album art - now much larger */}
              <div className="absolute inset-[20%] rounded-full overflow-hidden border-4 border-black">
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
              </div>

              {/* Center hole */}
              <div className="absolute inset-[48%] rounded-full bg-black"></div>
            </div>

            {/* Playlist title */}
            <div className="mt-4 text-center">
              <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                {playlist.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{playlist.tracks.length} tracks</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

