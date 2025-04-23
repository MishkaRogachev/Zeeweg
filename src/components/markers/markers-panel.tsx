'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AnchorProvider } from '@coral-xyz/anchor'

import MarkerEditor from './marker-editor'
import type { MapViewApi } from '../map/map-view'
import { upsertMarker as saveMarker, getMarkersByAuthor, Marker, deleteMarker, likeMarker } from '@/lib/markers'
import { markerIconAndColorByType } from '@/components/map/map-markers'
import { IconEdit, IconTrash, IconThumbUp, IconThumbDown } from '@tabler/icons-react'

type Props = {
  mapApiRef: React.MutableRefObject<MapViewApi | null>
  provider: AnchorProvider
  onMarkerUpdated: (lon: number, lat: number) => void
  onMarkerDeleted: (lon: number, lat: number) => void
}

enum PanelMode {
  ObserveMarkers,
  EditingMarker,
}

export default function InstrumentPanel({ mapApiRef, provider, onMarkerUpdated, onMarkerDeleted }: Props) {
  const [mode, setMode] = useState<PanelMode>(PanelMode.ObserveMarkers)
  const [initialMarker, setInitialMarker] = useState<Marker | null>(null)
  const [isNewMarker, setIsNewMarker] = useState(false)
  const [createdMarkers, setCreatedMarkers] = useState<Marker[]>([])

  const enterCreateMode = () => {
    const center = mapApiRef.current?.getCenter?.()
    const lat = center?.[0] ?? 0
    const lon = center?.[1] ?? 0

    const newMarker: Marker = {
      description: {
        name: '',
        details: '',
        markerType: { basic: {} },
      },
      position: { lat: Math.round(lat * 1e6), lon: Math.round(lon * 1e6) },
      likes: 0,
      author: provider.wallet.publicKey,
    }

    setIsNewMarker(true)
    setInitialMarker(newMarker)
    setMode(PanelMode.EditingMarker)

    mapApiRef.current?.startPicking(lon, lat, (lon, lat) => {
      setInitialMarker((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          position: {
            lat: Math.round(lat * 1e6),
            lon: Math.round(lon * 1e6),
          },
        }
      })
    })
  }

  const exitCreateMode = () => {
    mapApiRef.current?.stopPicking()
    setMode(PanelMode.ObserveMarkers)
    loadMyMarkers()
  }

  const saveMarkerImpl = async (marker: Marker) => {
    try {
      await saveMarker(provider, marker, isNewMarker)
      toast.success('Marker saved')
      onMarkerUpdated(marker.position.lon, marker.position.lat)
    } catch (err) {
      toast.error('Failed to save marker')
      console.error('Failed to add marker:', err)
    } finally {
      exitCreateMode()
    }
  }

  const deleteMarkerImpl = async (marker: Marker) => {
    try {
      await deleteMarker(provider, marker)
      toast.success('Marker deleted')
      onMarkerDeleted(marker.position.lon, marker.position.lat)
    } catch (err) {
      toast.error('Failed to delete marker')
      console.error('Failed to delete marker:', err)
    }
    finally {
      exitCreateMode()
    }
  }

  const likeMarkerImpl = async (marker: Marker) => {
    try {
      await likeMarker(provider, marker)
      toast.success('Marker liked')
      loadMyMarkers() // Refresh the markers to update the like count
    } catch (err) {
      toast.error('Failed to like marker')
      console.error('Failed to like marker:', err)
    }
  }

  const loadMyMarkers = useCallback(async () => {
    const pubkey = provider.wallet.publicKey
    if (!pubkey) return // not connected

    try {
      const all = await getMarkersByAuthor(provider, pubkey)
      setCreatedMarkers(all)
    } catch (err: any) {
      toast.error('Failed to load markers: validator unavailable')
    }
  }, [provider])
  
  const centerMarker = async (marker: Marker) => {
    mapApiRef.current?.translateToCenter(
      marker.position.lon / 1e6,
      marker.position.lat / 1e6
    )
  }

  useEffect(() => {
    loadMyMarkers()
  }, [loadMyMarkers])

  switch (mode) {
    case PanelMode.EditingMarker:
      if (!initialMarker) return null
      return (
        <MarkerEditor
          marker={initialMarker}
          isNewMarker={isNewMarker}
          onCancel={exitCreateMode}
          onSave={saveMarkerImpl}
          onDelete={deleteMarkerImpl}
          onLike={likeMarkerImpl}
        />
      )

    case PanelMode.ObserveMarkers:
    default:
      return (
        <div className="flex flex-col h-full space-y-4">
          <h2 className="text-lg font-semibold">Markers:</h2>

          <button
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-blue-700 transition"
            onClick={enterCreateMode}
          >
            Add New
          </button>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1 bg-black/20">
          {createdMarkers.map((marker, i) => {
            const [iconUrl, color] = markerIconAndColorByType(marker.description.markerType)
            const isOwner = marker.author?.toBase58() === provider.wallet.publicKey?.toBase58()

            return (
              <div
                key={i}
                className="group space-y-1 p-2 rounded bg-black/10 text-white hover:bg-black/20 transition"
              >
                {/* Header Row */}
                <div className="flex items-center space-x-2">
                  <button
                    className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color }}
                    onClick={() => centerMarker(marker)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={iconUrl} alt="icon" className="w-4 h-4" />
                  </button>

                  <span className="text-sm font-semibold flex-1 truncate">
                    {marker.description.name || '(Unnamed)'}
                  </span>

                  {isOwner && <span className="text-xs text-white/50">🛡️ owned</span>}
                </div>

                {/* Description */}
                <p className="text-xs text-white/70 line-clamp-2">{marker.description.details}</p>

                {/* Action Row */}
                <div className="flex items-center space-x-2 text-white/80 text-sm mt-1">
                  <button
                    className="hover:text-white transition flex items-center space-x-1"
                    onClick={() => likeMarkerImpl(marker)}
                  >
                    <IconThumbUp size={14} />
                    <span>{marker.likes}</span>
                  </button>
                  <button className="hover:text-white transition flex items-center space-x-1">
                    <IconThumbDown size={14} />
                    {/* TODO: dislikes */}
                    <span>0</span>
                  </button>

                  {isOwner && (
                    <>
                      <button
                        className="hover:text-white transition flex items-center space-x-1 ml-auto"
                        onClick={() => {
                          setIsNewMarker(false)
                          setInitialMarker(marker)
                          setMode(PanelMode.EditingMarker)
                        }}
                      >
                        <IconEdit size={14} />
                      </button>

                      <button
                        className="hover:text-white transition flex items-center space-x-1"
                        onClick={() => deleteMarkerImpl(marker)}
                      >
                        <IconTrash size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}