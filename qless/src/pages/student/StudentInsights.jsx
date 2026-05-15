import { MENU_ITEMS } from '../../lib/data'
import styles from './StudentInsights.module.css'

const WEEK = [
  {d:'MON',v:30},{d:'TUE',v:55},{d:'WED',v:90},{d:'THU',v:70},{d:'FRI',v:80},{d:'SAT',v:45},{d:'SUN',v:35}
]
const SPENDING = [
  {label:'Breakfast Items', pct:42, color:'var(--green)'},
  {label:'Lunch Dishes',    pct:35, color:'var(--green-mid)'},
  {label:'Snacks',          pct:23, color:'#86efac'},
]
const NUTRITION = [
  {label:'CALORIES', pct:78, color:'var(--green)'},
  {label:'PROTEIN',  pct:90, color:'var(--green-mid)'},
  {label:'CARBS',    pct:100,color:'#f59e0b'},
  {label:'FAT',      pct:42, color:'#ef4444'},
]
const FAVS = [
  {name:'Masala Dosa',  sub:'Ordered 12 times', price:'₹60',  img:'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=60&q=80'},
  {name:'Veg Biryani',  sub:'Ordered 8 times',  price:'₹120', img:MENU_ITEMS[9].img},
  {name:'Samosa Chaat', sub:'Ordered 6 times',  price:'₹50',  img:MENU_ITEMS[13].img},
]
const maxV = Math.max(...WEEK.map(d => d.v))

function Circle({ pct, color, label }) {
  const r=28, circ=2*Math.PI*r, fill=(pct/100)*circ
  return (
    <div className={styles.circleWrap}>
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r={r} fill="none" stroke="var(--border)" strokeWidth="6"/>
        <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" transform="rotate(-90 35 35)"/>
        <text x="35" y="40" textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="700">{pct}%</text>
      </svg>
      <span className={styles.circleLabel}>{label}</span>
    </div>
  )
}

export default function StudentInsights() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Insights Dashboard 📊</h1>
        <p className={styles.sub}>Track your spending, orders, and nutrition</p>

        <div className={styles.statsGrid}>
          {[
            {l:'TOTAL SPENDING', v:'₹2,458', s:'+12%', sc:'#10b981'},
            {l:'TOTAL ORDERS',   v:'42',     s:'+3',   sc:'#10b981'},
            {l:'AVG ORDER',      v:'₹58',    s:'Daily', sc:'var(--text-faint)'},
          ].map((s,i) => (
            <div key={i} className={styles.statCard}>
              <p className={styles.statLabel}>{s.l}</p>
              <div className={styles.statRow}>
                <span className={styles.statVal}>{s.v}</span>
                <span className={styles.statChip} style={{color:s.sc, background:s.sc+'22'}}>{s.s}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.row}>
          <div className={styles.chartCard}>
            <div className={styles.chartHead}>
              <h3 className={styles.cardTitle}>Weekly Activity</h3>
              <span className={styles.ordersChip}>● ORDERS</span>
            </div>
            <div className={styles.bars}>
              {WEEK.map(d => (
                <div key={d.d} className={styles.barCol}>
                  <div className={styles.bar} style={{height:`${(d.v/maxV)*110}px`}}/>
                  <span className={styles.barLabel}>{d.d}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.rightCard}>
            <h3 className={styles.cardTitle} style={{marginBottom:16}}>Spending Breakdown</h3>
            {SPENDING.map(s => (
              <div key={s.label} className={styles.spendRow}>
                <div className={styles.spendMeta}><span>{s.label}</span><span>{s.pct}%</span></div>
                <div className={styles.progressBg}>
                  <div className={styles.progressFill} style={{width:`${s.pct}%`, background:s.color}}/>
                </div>
              </div>
            ))}
            <h3 className={styles.cardTitle} style={{marginTop:20, marginBottom:12}}>Top Favorites</h3>
            {FAVS.map((f,i) => (
              <div key={i} className={styles.favRow}>
                <img src={f.img} className={styles.favImg} alt={f.name}/>
                <div className={styles.favInfo}>
                  <p className={styles.favName}>{f.name}</p>
                  <p className={styles.favSub}>{f.sub}</p>
                </div>
                <span className={styles.favPrice}>{f.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.nutritionCard}>
          <div className={styles.nutritionHead}>
            <h3 className={styles.cardTitle}>Nutrition Summary</h3>
            <p className={styles.nutritionSub}>You are on track with your protein goals this week! Keep it up.</p>
            <span className={styles.kcalChip}>DAILY AVG: 1,850 KCAL</span>
          </div>
          <div className={styles.circles}>
            {NUTRITION.map(n => <Circle key={n.label} pct={n.pct} color={n.color} label={n.label}/>)}
          </div>
        </div>
      </div>
    </div>
  )
}