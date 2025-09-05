import { type JSX } from 'react'

export interface NotesSectionProps {
  notes: string
  onNotesChange: (v: string) => void
  printNotes: boolean
  onPrintNotesChange: (v: boolean) => void
}

export function NotesSection({ notes, onNotesChange, printNotes, onPrintNotesChange }: NotesSectionProps): JSX.Element {
  return (
    <div className="space-y-2">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-300">Notas</span>
        <textarea
          className="min-h-24 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:ring"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Notas internas. Activa opción para mostrarlas en PDF"
        />
      </label>
      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
          checked={printNotes}
          onChange={(e) => onPrintNotesChange(e.target.checked)}
        />
        <span className="text-sm text-slate-300">Mostrar notas en PDF</span>
      </label>
    </div>
  )
}

export default NotesSection
