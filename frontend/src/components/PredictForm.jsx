import { useState } from "react"
import { STATE_OPTIONS, EVENT_TYPE_OPTIONS, MONTH_OPTIONS } from "../constants"

export default function PredictForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    state: "",
    month_name: "",
    event_type: "",
    injuries_direct: 0,
    magnitude: 0,
    duration_min: 0,
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleSubmit() {
    if (!form.state || !form.month_name || !form.event_type) return
    onSubmit({
      ...form,
      injuries_direct: Number(form.injuries_direct),
      magnitude: Number(form.magnitude),
      duration_min: Number(form.duration_min),
    })
  }

  const isValid = form.state && form.month_name && form.event_type

  return (
    <div className="bg-[#0d1426] border border-cyan-900/40 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-5 bg-cyan-400 rounded-full" />
        <h2 className="text-sm tracking-[0.2em] uppercase text-cyan-300">Event Parameters</h2>
      </div>

      <div className="space-y-4">
        {/* State */}
        <Field label="State" required>
          <Select
            value={form.state}
            onChange={v => set("state", v)}
            options={STATE_OPTIONS}
            placeholder="Select state..."
          />
        </Field>

        {/* Month */}
        <Field label="Month" required>
          <Select
            value={form.month_name}
            onChange={v => set("month_name", v)}
            options={MONTH_OPTIONS}
            placeholder="Select month..."
          />
        </Field>

        {/* Event Type */}
        <Field label="Event Type" required>
          <Select
            value={form.event_type}
            onChange={v => set("event_type", v)}
            options={EVENT_TYPE_OPTIONS}
            placeholder="Select event..."
          />
        </Field>

        {/* Injuries */}
        <Field label="Direct Injuries">
          <NumberInput
            value={form.injuries_direct}
            onChange={v => set("injuries_direct", v)}
            min={0}
          />
        </Field>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(s => !s)}
          className="w-full flex items-center justify-between py-2 px-3 border border-dashed border-cyan-900/60 rounded text-xs text-gray-500 hover:text-cyan-400 hover:border-cyan-700/60 transition-all"
        >
          <span className="tracking-widest uppercase">Advanced / Optional</span>
          <span className="text-lg leading-none">{showAdvanced ? "−" : "+"}</span>
        </button>

        {showAdvanced && (
          <div className="space-y-4 pl-3 border-l border-cyan-900/30">
            <p className="text-xs text-gray-600">These improve accuracy but are optional. Defaults to 0.</p>

            <Field label="Magnitude" hint="Wind speed (mph), hail size (in), etc.">
              <NumberInput
                value={form.magnitude}
                onChange={v => set("magnitude", v)}
                min={0}
                step={0.1}
                float
              />
            </Field>

            <Field label="Duration (minutes)" hint="How long the event lasted">
              <NumberInput
                value={form.duration_min}
                onChange={v => set("duration_min", v)}
                min={0}
                max={10000}
              />
            </Field>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className={`w-full py-3 rounded text-sm tracking-[0.2em] uppercase font-bold transition-all mt-2 ${
            isValid && !loading
              ? "bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400"
              : "bg-gray-800/40 border border-gray-700/40 text-gray-600 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block w-3 h-3 border border-cyan-400 border-t-transparent rounded-full" />
              Analyzing...
            </span>
          ) : "Predict Damage"}
        </button>
      </div>
    </div>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-gray-400 mb-1.5">
        {label}
        {required && <span className="text-cyan-500 ml-1">*</span>}
        {hint && <span className="text-gray-600 normal-case tracking-normal ml-2">— {hint}</span>}
      </label>
      {children}
    </div>
  )
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-[#060d1f] border border-cyan-900/40 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/60 appearance-none cursor-pointer"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(o => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
}

function NumberInput({ value, onChange, min, max, step = 1, float = false }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={e => onChange(float ? parseFloat(e.target.value) : parseInt(e.target.value))}
      className="w-full bg-[#060d1f] border border-cyan-900/40 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/60"
    />
  )
}