'use client'
import { useEffect, useState } from 'react'

type Unit = '円' | '千円' | '万円'
const MULT: Record<Unit, number> = { '円': 1, '千円': 1000, '万円': 10000 }

function bestUnit(raw: number): { display: string; unit: Unit } {
  if (raw === 0) return { display: '', unit: '円' }
  if (raw >= 10000 && raw % 10000 === 0) return { display: String(raw / 10000), unit: '万円' }
  if (raw >= 1000 && raw % 1000 === 0) return { display: String(raw / 1000), unit: '千円' }
  return { display: String(raw), unit: '円' }
}

interface Props {
  value: number
  onChange: (yen: number) => void
  className?: string
  placeholder?: string
  required?: boolean
}

export default function AmountInput({ value, onChange, className = '', placeholder = '0', required }: Props) {
  const init = bestUnit(value)
  const [unit, setUnit] = useState<Unit>(init.unit)
  const [display, setDisplay] = useState(init.display)

  useEffect(() => {
    const { display: d, unit: u } = bestUnit(value)
    setDisplay(d)
    setUnit(u)
  }, [value])

  const handleDisplay = (val: string) => {
    setDisplay(val)
    onChange(val === '' ? 0 : Math.round(Number(val) * MULT[unit]))
  }

  const handleUnit = (newUnit: Unit) => {
    const raw = display === '' ? 0 : Math.round(Number(display) * MULT[unit])
    const newDisplay = raw === 0 ? '' : raw % MULT[newUnit] === 0
      ? String(raw / MULT[newUnit])
      : display
    setUnit(newUnit)
    setDisplay(newDisplay)
    onChange(raw)
  }

  return (
    <div className="flex gap-1 items-center">
      <input
        type="number"
        value={display}
        onChange={e => handleDisplay(e.target.value)}
        className={`input-cell flex-1 min-w-0 ${className}`}
        placeholder={placeholder}
        required={required}
        min={0}
      />
      <select
        value={unit}
        onChange={e => handleUnit(e.target.value as Unit)}
        className="input-cell w-16 flex-shrink-0 text-center px-1"
        title="単位"
        aria-label="単位"
      >
        <option value="円">円</option>
        <option value="千円">千円</option>
        <option value="万円">万円</option>
      </select>
    </div>
  )
}
