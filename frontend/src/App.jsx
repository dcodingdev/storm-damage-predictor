import { useState } from "react"
import PredictForm from "./components/PredictForm"
import ResultPanel from "./components/ResultPanel"
import ModelStats from "./components/ModelStats"

// const API_BASE = "http://localhost:8000"
const API_BASE = "https://dcodingdev28-storm-damage-predictor.hf.space"

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("predict")

  async function handlePredict(formData) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Prediction failed")
      }
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-mono">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,200,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,200,255,0.03)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-cyan-900/40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-cyan-400 text-xs tracking-[0.3em] uppercase mb-1">NOAA · 1.78M Events · XGBoost</div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Storm<span className="text-cyan-400">Damage</span>Predictor
            </h1>
          </div>
          <div className="flex gap-1 bg-[#0d1426] border border-cyan-900/40 rounded p-1">
            {["predict", "models"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs tracking-widest uppercase rounded transition-all ${
                  activeTab === tab
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative max-w-6xl mx-auto px-6 py-8">
        {activeTab === "predict" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PredictForm onSubmit={handlePredict} loading={loading} />
            <ResultPanel result={result} error={error} loading={loading} />
          </div>
        )}
        {activeTab === "models" && (
          <ModelStats apiBase={API_BASE} />
        )}
      </main>
    </div>
  )
}