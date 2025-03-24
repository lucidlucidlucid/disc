"use client"

import { useEffect, useRef, useState } from "react"
import type { Track } from "@/types/playlist"
import { Button } from "@/components/ui/button"
import { Pause, Play, Volume2, VolumeX } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface AudioPlayerProps {
  track: Track
  isPlaying: boolean
  onPlayPause: () => void
  onEnded: () => void
}

export default function AudioPlayer({ track, isPlaying, onPlayPause, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.7)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch((err) => console.error("Error playing audio:", err))
    } else {
      audio.pause()
    }
  }, [isPlaying, track.url])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => onEnded()

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [onEnded])

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (audio) {
      const newVolume = value[0]
      audio.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume || 0.7
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  return (
    <div className="flex items-center gap-4 transition-all duration-300 ease-in-out">
      <audio ref={audioRef} src={track.url} />

      <Button
        variant="ghost"
        size="icon"
        onClick={onPlayPause}
        className="mr-2 transition-transform duration-200 hover:scale-110"
      >
        {isPlaying ? (
          <Pause className="h-6 w-6 transition-all duration-200" />
        ) : (
          <Play className="h-6 w-6 transition-all duration-200" />
        )}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-1">
          <span className="text-sm font-medium truncate mr-4">{track.title}</span>
          <span className="text-xs text-gray-500 shrink-0">
            {formatTime(currentTime)} / {formatTime(duration || 0)}
          </span>
        </div>

        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full transition-opacity duration-200 hover:opacity-100"
        />
      </div>

      <div className="flex items-center gap-2 ml-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="transition-transform duration-200 hover:scale-110"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 transition-all duration-200" />
          ) : (
            <Volume2 className="h-5 w-5 transition-all duration-200" />
          )}
        </Button>

        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-24 transition-opacity duration-200 hover:opacity-100"
        />
      </div>
    </div>
  )
}

