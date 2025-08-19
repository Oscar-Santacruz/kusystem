import { useMemo, useState, type JSX } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { DayPicker } from 'react-day-picker'
import { es } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'

export interface DatePickerProps {
  id?: string
  ariaLabel?: string
  // Permite asociar el label visible externo con el control
  labelId?: string
  value?: string // YYYY-MM-DD
  onChange: (val: string) => void
  placeholder?: string
  disabled?: boolean
}

function toISOLocalDateString(d: Date | undefined | null): string {
  if (!d) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseISOLocalDateString(s?: string | null): Date | undefined {
  if (!s) return undefined
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

export function DatePicker(props: DatePickerProps): JSX.Element {
  const { id, ariaLabel, labelId, value, onChange, placeholder = 'Seleccionar fecha', disabled } = props
  const selected = useMemo(() => parseISOLocalDateString(value ?? ''), [value])
  const [open, setOpen] = useState(false)
  const contentId = id ? `${id}-popover` : undefined

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          id={id}
          type="button"
          aria-label={ariaLabel}
          aria-labelledby={labelId}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={contentId}
          disabled={disabled}
          className="inline-flex w-full items-center justify-between rounded border border-slate-700 bg-slate-900 px-3 py-2 text-left text-white outline-none hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-60"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setOpen((v) => !v)
            } else if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            } else if (e.key === 'Escape') {
              if (open) {
                e.preventDefault()
                setOpen(false)
              }
            }
          }}
        >
          <span className={selected ? '' : 'text-slate-400'}>
            {selected ? selected.toLocaleDateString('es-AR') : placeholder}
          </span>
          <span className="flex items-center gap-1">
            {value ? (
              <button
                type="button"
                aria-label="Limpiar fecha"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange('')
                }}
                className="mr-1 rounded px-1 text-slate-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                ×
              </button>
            ) : null}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-slate-300" aria-hidden="true">
              <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 2 0v1Zm13 6H4v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8Z" />
            </svg>
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Content sideOffset={6} className="z-50 rounded border border-slate-700 bg-slate-900 p-2 shadow-xl text-slate-100 focus:outline-none" id={contentId}>
        <DayPicker
          mode="single"
          locale={es}
          selected={selected}
          onSelect={(d: Date | undefined) => {
            if (d) {
              onChange(toISOLocalDateString(d))
              setOpen(false)
            }
          }}
          weekStartsOn={1}
          showOutsideDays
          styles={{
            root: { backgroundColor: 'rgb(2 6 23)' }, // slate-950/900
            caption: { color: 'rgb(255 255 255)' },
            head: { color: 'rgb(148 163 184)' },
            head_cell: { color: 'rgb(148 163 184)' },
            nav_button: { color: 'rgb(203 213 225)' },
            day: { color: 'rgb(226 232 240)' },
            day_button: { color: 'rgb(226 232 240)' },
            day_outside: { color: 'rgb(100 116 139)' },
            day_today: { outline: '2px solid rgb(59 130 246)' },
            day_selected: { backgroundColor: 'rgb(30 64 175)', color: 'white' },
          }}
        />
      </Popover.Content>
    </Popover.Root>
  )
}

export default DatePicker
