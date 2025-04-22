'use client'

import { useRef } from 'react'
import { Coordinate } from 'ol/coordinate'
import { fromLonLat } from 'ol/proj'

import * as zeeweg from '@project/anchor'

import { getMarkersByTiles, getMarkerByLonLat, Marker } from '@/lib/markers'
import { Settings } from '@/lib/settings'

import MapView, { MapViewApi } from '../map/map-view'
import { useAnchorProvider } from '../solana/solana-provider'
import InstrumentPanel from './markers-panel'
import { getMarkerIdFromPosition, markerToSign } from '@/components/map/map-markers'

const MAX_TILES_TO_LOAD = 512

export default function MarkersFeature() {
  const saved = Settings.getMapSettings()
  const center = saved ? fromLonLat([saved.lon, saved.lat]) : fromLonLat([0, 0])
  const zoom = saved?.zoom ?? 2

  const provider = useAnchorProvider()
  const mapApiRef = useRef<MapViewApi>(null)

  const loadMarkers = async (tiles: { x: number; y: number }[]) => {
    try {
      const markers = await getMarkersByTiles(provider, tiles)

      const api = mapApiRef.current
      if (!api) return

      for (const marker of markers) {
        try {
          api.upsertSign(markerToSign(marker))
        } catch (err) {
          console.warn('Skipping unknown marker type:', marker, err)
        }
      }
    } catch (err) {
      console.error('Failed to load markers:', err)
    }
  }

  const onViewportChanged = async (topLeft: Coordinate, bottomRight: Coordinate, zoom: number) => {
    Settings.setMapSettings({
      lon: (topLeft[0] + bottomRight[0]) / 2,
      lat: (topLeft[1] + bottomRight[1]) / 2,
      zoom: zoom,
    })

    const [lonMin, latMax] = topLeft
    const [lonMax, latMin] = bottomRight

    const tileXMin = Math.floor((latMin * 1e6) / zeeweg.MARKER_TILE_RESOLUTION)
    const tileXMax = Math.floor((latMax * 1e6) / zeeweg.MARKER_TILE_RESOLUTION)
    const tileYMin = Math.floor((lonMin * 1e6) / zeeweg.MARKER_TILE_RESOLUTION)
    const tileYMax = Math.floor((lonMax * 1e6) / zeeweg.MARKER_TILE_RESOLUTION)

    const tileCount = (tileXMax - tileXMin + 1) * (tileYMax - tileYMin + 1)
    if (tileCount > MAX_TILES_TO_LOAD) {
      console.warn(`Too many tiles: ${tileCount}, skipping marker load`)
      return
    }

    const tiles: { x: number; y: number }[] = []
    for (let x = tileXMin; x <= tileXMax; x++) {
      for (let y = tileYMin; y <= tileYMax; y++) {
        tiles.push({ x, y })
      }
    }

    loadMarkers(tiles)
  }

  const onMarkerUpdated = async (lon: number, lat: number) => {
    const api = mapApiRef.current
    if (!api) return

    // Reload marker from the provider
    const marker = await getMarkerByLonLat(provider, lon, lat)
    if (!marker) {
      console.warn('Marker not found')
      return
    }
    api.upsertSign(markerToSign(marker))
  }

  const onMarkerDeleted = async (lon: number, lat: number) => {
    const api = mapApiRef.current
    if (!api) return

    const id = getMarkerIdFromPosition({ lon, lat })

    api.removeSign(id)
  }

  return (
    <div className="flex w-screen h-full">
      <div className="w-64 h-full flex-col shadow-md z-10 p-4">
        <InstrumentPanel mapApiRef={mapApiRef} provider={provider} onMarkerUpdated={onMarkerUpdated} onMarkerDeleted={onMarkerDeleted}/>
      </div>
      <div className="flex-grow">
        <MapView
          apiRef={mapApiRef}
          center={center}
          zoom={zoom}
          onViewportChanged={onViewportChanged}
        />
      </div>
    </div>
  )
}
