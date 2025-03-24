export interface Track {
  id: string
  title: string
  url: string
  duration: number
  addedAt: string
}

export interface Playlist {
  id: string
  title: string
  coverUrl: string | null
  tracks: Track[]
  createdAt: string
}

