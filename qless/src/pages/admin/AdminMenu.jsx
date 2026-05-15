import { useState, useEffect } from 'react'
import { getMenuImage } from '../../lib/menuImages'
import { fetchMenu, updateMenuItemAvailability, updateMenuItem, deleteMenuItem } from '../../api/server'
import styles from './AdminMenu.module.css'

const TABS = ['All Items', 'Breakfast', 'Lunch', 'Snacks']

export default function AdminMenu() {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('All Items')
  const [search,   setSearch]   = useState('')
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({})
  // track per-item saving state so the toggle shows a spinner
  const [toggling, setToggling] = useState({})

  // ── Load all items (admin view — includes unavailable) ───────────────────────
  useEffect(() => {
    fetchMenu({ all: true })
      .then(data => setItems(data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(m =>
    (tab === 'All Items' || m.cat === tab) &&
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  // ── Availability toggle ───────────────────────────────────────────────────────
  const toggleAvail = async (item) => {
    const newVal = !item.available
    // Optimistic update
    setItems(prev => prev.map(i => i._id === item._id ? { ...i, available: newVal } : i))
    setToggling(prev => ({ ...prev, [item._id]: true }))
    try {
      await updateMenuItemAvailability(item._id, newVal)
    } catch {
      // Revert on failure
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, available: item.available } : i))
    } finally {
      setToggling(prev => ({ ...prev, [item._id]: false }))
    }
  }

  // ── Edit panel ───────────────────────────────────────────────────────────────
  const openEdit  = item => { setEditItem(item); setEditForm({ ...item }) }
  const closeEdit = () => setEditItem(null)

  const saveEdit = async () => {
    try {
      const updated = await updateMenuItem(editForm._id, {
        name: editForm.name,
        price: editForm.price,
        cat: editForm.cat,
        desc: editForm.desc,
        available: editForm.available,
      })
      setItems(prev => prev.map(i => i._id === updated._id ? updated : i))
      closeEdit()
    } catch (err) {
      alert("Save failed: " + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return
    await deleteMenuItem(id)
    setItems(prev => prev.filter(i => i._id !== id))
  }

  if (loading) return <div className={styles.page}><p style={{ padding: 40 }}>Loading menu...</p></div>

  return (
    <div className={styles.page}>
      <div className={styles.main}>

        {/* Search */}
        <div className={styles.searchRow}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by food name..." />
        </div>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Menu Management</h1>
            <p className={styles.sub}>Manage food items, pricing, and daily availability across campus.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={tab === t ? styles.tabActive : styles.tab}>{t}</button>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {filtered.map(item => (
            <div key={item._id} className={`${styles.card} ${!item.available ? styles.unavailable : ''}`}>
              <div className={styles.cardImg}>
                {/* Image: use placeholder — in prod swap for img src from DB or static imports */}
                <img src={getMenuImage(item.name)} alt={item.name} alt={item.name} />
                <span className={styles.catBadge}>{item.cat.toUpperCase()}</span>
                {!item.available && <span className={styles.outBadge}>OUT OF STOCK</span>}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <p className={styles.cardName}>{item.name}</p>
                  <p className={styles.cardPrice}>₹{item.price}</p>
                </div>

                {/* ── Availability quick-toggle ── */}
                <div className={styles.availRow}>
                  <span className={`${styles.availDot} ${item.available ? styles.availGreen : styles.availGrey}`} />
                  <span className={styles.availText}>{item.available ? 'AVAILABLE' : 'UNAVAILABLE'}</span>

                  {/* Toggle switch — flips availability without opening edit panel */}
                  <label
                    className={styles.toggle}
                    title={item.available ? 'Mark unavailable' : 'Mark available'}
                    style={{ marginLeft: 'auto', opacity: toggling[item._id] ? 0.5 : 1 }}
                  >
                    <input
                      type="checkbox"
                      checked={item.available}
                      disabled={!!toggling[item._id]}
                      onChange={() => toggleAvail(item)}
                    />
                    <span className={styles.slider} />
                  </label>
                </div>

                <div className={styles.cardActions}>
                  <button className={styles.editBtn} onClick={() => openEdit(item)}>✏</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(item._id)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className={styles.addBtn}>+ New Menu Item</button>
      </div>

      {/* Edit Panel */}
      {editItem && (
        <div className={styles.editOverlay} onClick={closeEdit}>
          <div className={styles.editPanel} onClick={e => e.stopPropagation()}>
            <div className={styles.editHead}>
              <div>
                <h3 className={styles.editTitle}>Edit Item</h3>
                <p className={styles.editSub}>Update menu details &amp; stock</p>
              </div>
              <button className={styles.closeBtn} onClick={closeEdit}>✕</button>
            </div>

            <div className={styles.editBody}>
              <div className={styles.field}>
                <label>ITEM NAME</label>
                <input value={editForm.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>PRICE (₹)</label>
                  <input type="number" value={editForm.price || ''} onChange={e => setEditForm(p => ({ ...p, price: +e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label>CATEGORY</label>
                  <select value={editForm.cat || 'Lunch'} onChange={e => setEditForm(p => ({ ...p, cat: e.target.value }))}>
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Snacks</option>
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label>DESCRIPTION</label>
                <textarea rows={3} value={editForm.desc || ''} onChange={e => setEditForm(p => ({ ...p, desc: e.target.value }))} />
              </div>
              <div className={styles.toggleRow}>
                <div>
                  <p className={styles.toggleLabel}>Available for Orders</p>
                  <p className={styles.toggleSub}>Visible to students on the app</p>
                </div>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={editForm.available !== false}
                    onChange={e => setEditForm(p => ({ ...p, available: e.target.checked }))} />
                  <span className={styles.slider} />
                </label>
              </div>
            </div>

            <div className={styles.editFoot}>
              <button className={styles.discardBtn} onClick={closeEdit}>Discard</button>
              <button className={styles.saveBtn} onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
