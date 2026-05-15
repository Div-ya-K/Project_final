import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fetchCurrentPredictions, fetchNextPredictions, checkHealth } from '../../api/predictions'
import styles from './AdminPredictions.module.css'

export default function AdminPredictions() {
  const [current, setCurrent] = useState(null)
  const [next, setNext] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const h = await checkHealth()
      console.log("Health:", h)

      const c = await fetchCurrentPredictions()
      console.log("Current:", c)

      const n = await fetchNextPredictions()
      console.log("Next:", n)

      setHealth(h)
      setCurrent(c)
      setNext(n)

      setLoading(false)
    }

    load()
  }, [])

  const top3 = (current?.predictions ?? []).slice(0, 3)

  const chartData = (next?.predictions ?? [])
    .slice(0, 7)
    .map(p => ({
      name: p.dish,
      orders: p.predicted_orders
    }))

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading predictions...</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Demand Predictions</h1>
          <p className={styles.pageSub}>ML-powered forecasts for next slot</p>
        </div>

        <div className={styles.statusChip}
          style={{
            background: health?.mode === 'live' ? '#d1fae5' : '#fef3c7',
            color: health?.mode === 'live' ? '#059669' : '#d97706'
          }}>
          {health?.mode === 'live' ? 'Live Model' : 'Demo Mode'}
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>CURRENT SLOT</p>
          <p className={styles.kpiVal}>{current?.slot ?? '--'}</p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>TOTAL CURRENT ORDERS</p>
          <p className={styles.kpiVal}>
            {current?.predictions?.reduce((s, p) => s + p.predicted_orders, 0) ?? '--'}
          </p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>NEXT SLOT</p>
          <p className={styles.kpiVal}>{next?.slot ?? '--'}</p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>NEXT SLOT ORDERS</p>
          <p className={styles.kpiVal}>
            {next?.predictions?.reduce((s, p) => s + p.predicted_orders, 0) ?? '--'}
          </p>
        </div>
      </div>

      {/* Top dishes */}
      <div className={styles.top3Row}>
        {top3.map((p, i) => (
          <div key={p.dish} className={styles.top3Card}>
            <div className={styles.top3Rank}>#{i + 1}</div>
            <div>
              <p className={styles.top3Name}>{p.dish}</p>
              <p className={styles.top3Sub}>
                {p.confidence}% · {p.trend}
              </p>
            </div>
            <div>
              <p className={styles.top3Orders}>{p.predicted_orders}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className={styles.card}>
        <h3>📊 Next Slot Demand ({next?.slot})</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0}/>
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <cell
                  key={`cell-${index}`}
                  fill={entry.orders === Math.max(...chartData.map(d => d.orders))
                    ? "#ef4444"   // 🔴 highest
                    : "#1a6b3a"}  // 🟢 others
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}