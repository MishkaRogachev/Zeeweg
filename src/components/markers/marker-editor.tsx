'use client'

import { useEffect, useState } from 'react'

import * as zeeweg from '@project/anchor'
import { Marker } from '@/lib/markers'

export const markerTypeNames = [
  'basic',
  'park',
  'beach',
  'mountainPeak',
  'historical',
  'restaurant',
  'hazard',
] as const

type MarkerTypeName = (typeof markerTypeNames)[number]

export type MarkerEditorProps = {
  marker: Marker
  isNewMarker: boolean
  onCancel: () => void
  onSave: (marker: Marker) => void
  onDelete: (marker: Marker) => void
}

export default function MarkerEditor({ marker, isNewMarker, onCancel, onSave, onDelete }: MarkerEditorProps) {
  const [draft, setDraft] = useState(marker)

  useEffect(() => {
    setDraft((prev) => ({
      ...prev,
      position: marker.position,
    }))
  }, [marker.position])

  const canDelete = !isNewMarker
  const canSave =
    draft.description.name.trim().length > 0 &&
    (draft.position.lat !== 0 || draft.position.lon !== 0) &&
    (isNewMarker || (draft.description.name !== marker.description.name || draft.description.details !== marker.description.details))
  const selectedType = Object.keys(draft.description.markerType)[0] as MarkerTypeName

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{isNewMarker ? "New Marker" : "Edit Marker"}</h2>

      <input
        className="w-full px-4 py-2 rounded bg-black border border-white text-white"
        type="text"
        placeholder="Name"
        value={draft.description.name}
        onChange={
          (e) => setDraft({
            ...draft,
            description: {
              ...draft.description,
              name: e.target.value,
            },
          })
        }
      />

      <textarea
        className="w-full px-4 py-2 rounded bg-black border border-white text-white"
        rows={3}
        placeholder="Details"
        value={draft.description.details}
        onChange={
          (e) => setDraft({
            ...draft,
            description: {
              ...draft.description,
              details: e.target.value,
            },
          })
        }
      />

      <select
        className="w-full px-4 py-2 rounded bg-black border border-white text-white"
        value={selectedType}
        onChange={
          (e) => setDraft({
            ...draft,
            description: {
              ...draft.description,
              markerType: { [e.target.value]: {} } as zeeweg.MarkerType,
            },
          })
        }
      >
        {markerTypeNames.map((type) => (
          <option key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </option>
        ))}
      </select>

      <div>
        <label className="text-sm text-white">Position</label>
        <input
          readOnly
          className="w-full px-4 py-2 rounded bg-black border border-white text-white disabled"
          value={`${(draft.position.lat / 1e6).toFixed(6)}, ${(draft.position.lon / 1e6).toFixed(6)}`}
        />
      </div>

      <div className="flex justify-between space-x-2">
        <button
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-40"
          disabled={!canSave}
          onClick={() => onSave(draft)}
        >
          Save
        </button>
      </div>
      {canDelete && (
        <button
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          onClick={() => onDelete(marker)}
        >
          Delete
        </button>
      )}
    </div>
  )
}