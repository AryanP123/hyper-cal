import { listTimeZones } from '../lib/time'

type Props = {
  value: string
  onChange: (tz: string) => void
}

export function TimezoneSelect({ value, onChange }: Props) {
  const zones = listTimeZones()
  const options = zones.includes(value) ? zones : [value, ...zones]

  return (
    <label className="tz-select">
      <span>Timezone</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((tz) => (
          <option key={tz} value={tz}>
            {tz.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    </label>
  )
}
