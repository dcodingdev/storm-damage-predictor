import { useState, useEffect } from "react"

const MODEL_COLORS = {
  XGBoost_tuned:      "text-cyan-300 bg-cyan-500/10 border-cyan-500/30",
  XGBoost_untuned:    "text-blue-300 bg-blue-500/10 border-blue-500/30",
  RandomForest:       "text-green-300 bg-green-500/10 border-green-500/30",
  LogisticRegression: "text-gray-300 bg-gray-500/10 border-gray-500/30",
}

export default function ModelStats({ apiBase }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${apiBase}/metrics`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setError("Could not load metrics"))
  }, [apiBase])

  if (error) return (
    <div className="bg-[#0d1426] border border-rose-900/40 rounded-lg p-6 text-rose-300 text-sm">{error}</div>
  )

  if (!data) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const maxF1 = Math.max(...data.models.map(m => m.weighted_f1))

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="text-xs tracking-[0.3em] uppercase text-cyan-400 mb-1">Model Comparison</div>
        <h2 className="text-xl font-bold text-white">Winner: <span className="text-cyan-400">{data.winner}</span></h2>
      </div>

      {/* Model cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.models
          .sort((a, b) => b.weighted_f1 - a.weighted_f1)
          .map((m, i) => {
            const isWinner = m.model === data.winner
            const colorCls = MODEL_COLORS[m.model] || MODEL_COLORS.LogisticRegression
            const pct = (m.weighted_f1 / maxF1) * 100

            return (
              <div
                key={m.model}
                className={`bg-[#0d1426] border rounded-lg p-4 ${isWinner ? "border-cyan-500/50" : "border-cyan-900/30"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">#{i + 1}</div>
                    <div className={`text-sm font-bold px-2 py-0.5 rounded border inline-block ${colorCls}`}>
                      {m.model.replace(/_/g, " ")}
                    </div>
                  </div>
                  {isWinner && (
                    <span className="text-xs text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded tracking-widest">BEST</span>
                  )}
                </div>

                <div className="text-2xl font-bold text-white mb-2">
                  {(m.weighted_f1 * 100).toFixed(2)}
                  <span className="text-sm text-gray-500 ml-1">F1</span>
                </div>

                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isWinner ? "bg-cyan-400" : "bg-gray-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
      </div>

      {/* Best params */}
      <div className="bg-[#0d1426] border border-cyan-900/30 rounded-lg p-5">
        <div className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-4">Best Params — XGBoost Tuned (Optuna 50 trials)</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(data.best_params).map(([k, v]) => (
            <div key={k} className="bg-[#060d1f] rounded p-3">
              <div className="text-xs text-gray-600 mb-1 font-mono">{k}</div>
              <div className="text-sm text-cyan-300 font-mono font-bold">
                {typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(4)) : String(v)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}