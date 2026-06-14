const TIER_CONFIG = {
  None:   { color: "text-gray-300",  border: "border-gray-500/40",  bg: "bg-gray-500/10",  bar: "bg-gray-400" },
  Low:    { color: "text-green-300", border: "border-green-500/40", bg: "bg-green-500/10", bar: "bg-green-400" },
  Medium: { color: "text-yellow-300",border: "border-yellow-500/40",bg: "bg-yellow-500/10",bar: "bg-yellow-400" },
  High:   { color: "text-red-300",   border: "border-red-500/40",   bg: "bg-red-500/10",   bar: "bg-red-400" },
}

export default function ResultPanel({ result, error, loading }) {
  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />
  if (!result) return <EmptyState />

  const tier = TIER_CONFIG[result.predicted_tier] || TIER_CONFIG.None

  return (
    <div className="space-y-4">
      {/* Tier badge */}
      <div className={`bg-[#0d1426] border ${tier.border} rounded-lg p-6`}>
        <div className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">Predicted Damage Tier</div>
        <div className="flex items-end gap-4">
          <div className={`text-5xl font-bold tracking-tight ${tier.color}`}>
            {result.predicted_tier}
          </div>
          <div className="pb-1.5">
            <div className="text-xs text-gray-500 mb-0.5">Confidence</div>
            <div className={`text-xl font-bold ${tier.color}`}>
              {(result.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${tier.bar} rounded-full transition-all duration-700`}
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Probabilities */}
      <div className="bg-[#0d1426] border border-cyan-900/40 rounded-lg p-5">
        <div className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-4">Class Probabilities</div>
        <div className="space-y-2.5">
          {result.probabilities.map(({ tier: t, probability }) => {
            const cfg = TIER_CONFIG[t]
            const pct = (probability * 100)
            return (
              <div key={t} className="flex items-center gap-3">
                <div className={`w-14 text-xs ${cfg.color} text-right`}>{t}</div>
                <div className="flex-1 h-5 bg-gray-800/60 rounded overflow-hidden">
                  <div
                    className={`h-full ${cfg.bar} opacity-70 rounded transition-all duration-700`}
                    style={{ width: `${Math.max(pct, 0.3)}%` }}
                  />
                </div>
                <div className="w-14 text-xs text-gray-400 font-mono">{pct.toFixed(2)}%</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SHAP */}
      {result.shap?.top_features?.length > 0 && (
        <ShapChart shap={result.shap} predictedTier={result.predicted_tier} />
      )}
    </div>
  )
}

function ShapChart({ shap, predictedTier }) {
  const features = shap.top_features
  const maxAbs = Math.max(...features.map(f => Math.abs(f.shap_value)))

  return (
    <div className="bg-[#0d1426] border border-cyan-900/40 rounded-lg p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs tracking-[0.2em] uppercase text-gray-500">SHAP — Why {predictedTier}?</div>
        <div className="flex gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block"/>pushes toward</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"/>pushes away</span>
        </div>
      </div>
      <div className="text-xs text-gray-600 mb-4">Top 5 features driving this prediction</div>

      <div className="space-y-3">
        {features.map((f) => {
          const positive = f.shap_value >= 0
          const widthPct = (Math.abs(f.shap_value) / maxAbs) * 100
          return (
            <div key={f.feature}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-300 font-mono">{f.feature}</span>
                <span className="text-xs text-gray-500 font-mono">
                  val={formatVal(f.feature_value)} · shap={f.shap_value > 0 ? "+" : ""}{f.shap_value.toFixed(3)}
                </span>
              </div>
              <div className="h-4 bg-gray-800/60 rounded overflow-hidden">
                <div
                  className={`h-full rounded transition-all duration-700 ${positive ? "bg-cyan-500/70" : "bg-rose-500/70"}`}
                  style={{ width: `${Math.max(widthPct, 1)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatVal(v) {
  if (v > 100000) return (v / 1000000).toFixed(1) + "M"
  if (v > 1000)   return (v / 1000).toFixed(1) + "K"
  return Number.isInteger(v) ? v : v.toFixed(2)
}

function EmptyState() {
  return (
    <div className="bg-[#0d1426] border border-cyan-900/20 rounded-lg p-8 flex flex-col items-center justify-center min-h-75 text-center">
      <div className="text-4xl mb-4 opacity-30">⛈</div>
      <div className="text-gray-600 text-sm tracking-wide">Fill in event parameters and hit predict</div>
      <div className="text-gray-700 text-xs mt-2">SHAP explanation will appear here</div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="bg-[#0d1426] border border-cyan-900/30 rounded-lg p-8 flex flex-col items-center justify-center min-h-75">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
      <div className="text-cyan-500/60 text-xs tracking-widest uppercase">Running model...</div>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="bg-[#0d1426] border border-rose-900/40 rounded-lg p-6">
      <div className="text-xs tracking-widest uppercase text-rose-500 mb-2">Error</div>
      <div className="text-sm text-rose-300 font-mono">{message}</div>
    </div>
  )
}