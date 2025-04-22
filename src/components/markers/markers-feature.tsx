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
      console.warn(`Too many tiles to load: ${tileCount}, skipping marker load`)
      return
    }
    // if (tileCount <= 0) {
    //     console.warn(`Invalid tile range calculated: ${tileCount}`);
    //     return;
    // }


    const tiles: { x: number; y: number }[] = []
    for (let x = tileXMin; x <= tileXMax; x++) {
      for (let y = tileYMin; y <= tileYMax; y++) {
        tiles.push({ x, y })
      }
    }
    console.log(`Loading ${tiles.length} tiles...`); // Debug log
    if (tiles.length > 0) {
        loadMarkers(tiles)
    }
    
  }

  const onMarkerUpdated = async (lon: number, lat: number) => {
    const api = mapApiRef.current
    if (!api) return

    // Reload marker from the provider
    try {
        const marker = await getMarkerByLonLat(provider, lon, lat)
        if (!marker) {
          console.warn(`Marker not found after update at ${lon}, ${lat}`)
          // Optionally remove the sign if it's confirmed gone
          // const id = getMarkerIdFromPosition({ lon, lat });
          // api.removeSign(id);
          return
        }
        api.upsertSign(markerToSign(marker))
    } catch (error) {
        console.error(`Failed to reload marker at ${lon}, ${lat}:`, error);
    }
  }

  const onMarkerDeleted = async (lon: number, lat: number) => {
    const api = mapApiRef.current
    if (!api) return

    const id = getMarkerIdFromPosition({ lon, lat })
    api.removeSign(id)
  }

  return (
    <div className="flex flex-col w-screen h-[85vh] bg-gray-800 text-white">
      {/* Top Navigation */}
      <nav className="flex-shrink-0 h-16 bg-gray-900 shadow-md flex items-center px-4">
        <h1 className="text-xl font-semibold">Zeeweg Map</h1>
      </nav>
  
      {/* Main Content Area */}
      <main className="flex flex-1">
        {/* Markers Panel */}
        <aside className="w-80 flex-shrink-0 bg-gray-700 shadow-lg max-h-[70vh] flex flex-col p-4">
          {/* Panel header/filter content here */}
          <div className="flex-1 flex flex-col">
            {/* Markers list should scroll if needed */}
            <div className="flex-1 overflow-y-auto p-2 bg-gray-800 rounded max-h-[70vh]">
              <InstrumentPanel
                mapApiRef={mapApiRef}
                provider={provider}
                onMarkerUpdated={onMarkerUpdated}
                onMarkerDeleted={onMarkerDeleted}
              />
            </div>
          </div>
        </aside>
  
        {/* Map View */}
        <section className="flex-1 flex flex-col max-w-screen-2xl max-h-[70vh] overflow-hidden">
          <div className="flex-1">
            <MapView
              apiRef={mapApiRef}
              center={center}
              zoom={zoom}
              onViewportChanged={onViewportChanged}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
