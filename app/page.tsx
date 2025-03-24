import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import PlaylistGrid from "@/components/playlist-grid"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">disc.</h1>
          <p className="text-gray-500 mt-1">Your music collections</p>
        </header>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-gray-800">Your Playlists</h2>
          <Link href="/create-playlist">
            <Button variant="outline" className="flex items-center gap-2 rounded-full px-4">
              <PlusCircle className="h-4 w-4" />
              <span>New Playlist</span>
            </Button>
          </Link>
        </div>

        <PlaylistGrid />
      </div>
    </div>
  )
}

