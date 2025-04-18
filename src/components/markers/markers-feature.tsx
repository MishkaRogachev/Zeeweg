'use client'

import { useRef } from 'react'
import { Coordinate } from 'ol/coordinate'
import { fromLonLat } from 'ol/proj'

import * as zeeweg from '@project/anchor'

import { getMarkersForTiles, loadMarkerByLonLat, Marker } from '@/lib/markers'
import { Settings } from '@/lib/settings'

import MapView, { MapSign, MapViewApi } from '../map/map-view'
import { useAnchorProvider } from '../solana/solana-provider'
import InstrumentPanel from './markers-panel'

const MAX_TILES_TO_LOAD = 512

export const markerToSign = (marker: Marker): MapSign => {
  const lat = marker.position.lat / 1e6
  const lon = marker.position.lon / 1e6
  const type = marker.description.markerType

  let iconUrl: string
  let color: string

  if ('basic' in type) {
    iconUrl = '/map/marker-basic.svg'
    color = '#757575' // gray
  } else if ('park' in type) {
    iconUrl = '/map/marker-park.svg'
    color = '#4CAF50' // green
  } else if ('beach' in type) {
    iconUrl = '/map/marker-beach.svg'
    color = '#03A9F4' // light blue
  } else if ('mountainPeak' in type) {
    iconUrl = '/map/marker-peak.svg'
    color = '#9C27B0' // purple
  } else if ('historical' in type) {
    iconUrl = '/map/marker-historical.svg'
    color = '#795548' // brown
  } else if ('restaurant' in type) {
    iconUrl = '/map/marker-restaurant.svg'
    color = '#F44336' // red
  } else if ('hazard' in type) {
    iconUrl = '/map/marker-hazard.svg'
    color = '#FF9800' // orange
  } else {
    // Exhaustive guard
    throw new Error('Unknown marker type')
  }

  return {
    id: `${lat}_${lon}`,
    name: marker.description.name,
    description: marker.description.details,
    iconUrl,
    color,
    position: [lat, lon],
  }
}

export default function MarkersFeature() {
  const saved = Settings.getMapSettings()
  const center = saved ? fromLonLat([saved.lon, saved.lat]) : fromLonLat([0, 0])
  const zoom = saved?.zoom ?? 2

  const provider = useAnchorProvider()
  const mapApiRef = useRef<MapViewApi>(null)

  const loadMarkers = async (tiles: { x: number; y: number }[]) => {
    try {
      const markers = await getMarkersForTiles(provider, tiles)

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

    try {
      const marker = await loadMarkerByLonLat(provider, lon, lat)
      api.upsertSign(markerToSign(marker))
    } catch (err) {
      console.error('Failed to load marker:', err)
    }
  }

  return (
    <div className="flex w-screen h-screen">
      <div className="w-64 shadow-md z-10 p-4">
        <InstrumentPanel mapApiRef={mapApiRef} provider={provider} onMarkerUpdated={onMarkerUpdated}/>
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
