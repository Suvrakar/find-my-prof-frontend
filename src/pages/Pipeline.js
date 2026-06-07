import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { pipelineService, savedService } from '../services/api';

// ─── Stage config ──────────────────────────────────────────────────────────────
const STAGES = [
  { id: 'saved',    label: 'Saved',    color: '#6366f1', bg: 'rgba(99,102,241,0.07)',  icon: 'Bookmark', desc: 'On your radar'     },
  { id: 'emailed',  label: 'Emailed',  color: '#d97706', bg: 'rgba(217,119,6,0.07)',   icon: 'Send',     desc: 'Cold email sent'   },
  { id: 'replied',  label: 'Replied',  color: '#059669', bg: 'rgba(5,150,105,0.07)',   icon: 'Reply',    desc: 'Got a response'    },
  { id: 'applied',  label: 'Applied',  color: '#2563eb', bg: 'rgba(37,99,235,0.07)',   icon: 'FileText', desc: 'Formally applied'  },
  { id: 'accepted', label: 'Accepted', color: '#0d9488', bg: 'rgba(13,148,136,0.07)', icon: 'Award',    desc: 'Offer received'    },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr);
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 30)  return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

const AV_COLORS = ['#6366f1','#d97706','#059669','#2563eb','#8b5cf6','#ec4899','#0d9488'];
function avatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AV_COLORS[h % AV_COLORS.length];
}
function initials(name = '') {
  return name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
}

function Avatar({ name, size = 30 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: avatarColor(name), color: '#fff',
      display: 'grid', placeItems: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
      letterSpacing: '-0.01em',
    }}>
      {initials(name)}
    </div>
  );
}

// ─── Add / Edit Modal ──────────────────────────────────────────────────────────
function EntryModal({ entry, savedProfs, defaultStage, onSave, onClose }) {
  const editing   = !!entry;
  const [profName,  setProfName]  = useState(entry?.prof_name  || '');
  const [profAffil, setProfAffil] = useState(entry?.prof_affil || '');
  const [profDept,  setProfDept]  = useState(entry?.prof_dept  || '');
  const [stage,     setStage]     = useState(entry?.stage || defaultStage || 'saved');
  const [notes,     setNotes]     = useState(entry?.notes || '');
  const [query,     setQuery]     = useState('');
  const [saving,    setSaving]    = useState(false);

  const filtered = (savedProfs || [])
    .filter(p => p.name?.toLowerCase().includes(query.toLowerCase()) && query.length > 0)
    .slice(0, 6);

  const pickSaved = (p) => {
    setProfName(p.name || '');
    setProfAffil(p.affiliation || '');
    setProfDept(p.department || '');
    setQuery('');
  };

  const handleSave = async () => {
    if (!profName.trim() || saving) return;
    setSaving(true);
    try {
      await onSave({ prof_name: profName.trim(), prof_affil: profAffil.trim(), prof_dept: profDept.trim(), stage, notes });
    } finally {
      setSaving(false);
    }
  };

  const activeStage = STAGES.find(s => s.id === stage);

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(15,20,30,0.45)', zIndex:50,
        display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="card" style={{ width:500, maxHeight:'90vh', overflowY:'auto', padding:0, boxShadow:'var(--shadow-3)' }}>
        {/* Modal header */}
        <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--line)' }}>
          <div className="row between">
            <span style={{ fontWeight:600, fontSize:16, letterSpacing:'-0.02em' }}>
              {editing ? 'Edit entry' : 'Add to Pipeline'}
            </span>
            <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ marginRight:-4 }}>
              <Icon.X size={14}/>
            </button>
          </div>
        </div>

        <div style={{ padding:24 }}>
          {/* Saved professors quick-pick */}
          {!editing && savedProfs?.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>
                Quick add from saved
              </div>
              <div style={{ position:'relative' }}>
                <Icon.Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--ink-4)' }}/>
                <input
                  className="input"
                  placeholder="Search saved professors…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{ paddingLeft:32 }}
                />
              </div>
              {filtered.length > 0 && (
                <div style={{ marginTop:4, border:'1px solid var(--line)', borderRadius:8, overflow:'hidden', boxShadow:'var(--shadow-2)' }}>
                  {filtered.map(p => (
                    <div key={p.id}
                      onClick={() => pickSaved(p)}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
                        cursor:'pointer', background:'white', borderBottom:'1px solid var(--line)',
                        transition:'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--paper-2)'}
                      onMouseLeave={e => e.currentTarget.style.background='white'}
                    >
                      <Avatar name={p.name} size={24}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
                        {p.affiliation && <div style={{ fontSize:11, color:'var(--ink-4)' }}>{p.affiliation}</div>}
                      </div>
                      <Icon.Plus size={12} style={{ color:'var(--ink-4)', flexShrink:0 }}/>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0 0', color:'var(--ink-4)', fontSize:12 }}>
                <div style={{ flex:1, height:'1px', background:'var(--line)' }}/>
                <span>or enter manually</span>
                <div style={{ flex:1, height:'1px', background:'var(--line)' }}/>
              </div>
            </div>
          )}

          {/* Form fields */}
          <div className="col" style={{ gap:12 }}>
            <div className="row gap-3">
              <div style={{ flex:1 }}>
                <label className="label">Professor name *</label>
                <input className="input" value={profName} onChange={e => setProfName(e.target.value)}
                  placeholder="e.g. Jane Kim" autoFocus={!savedProfs?.length}/>
              </div>
            </div>
            <div className="row gap-3">
              <div style={{ flex:1 }}>
                <label className="label">Institution</label>
                <input className="input" value={profAffil} onChange={e => setProfAffil(e.target.value)} placeholder="e.g. MIT"/>
              </div>
              <div style={{ flex:1 }}>
                <label className="label">Department</label>
                <input className="input" value={profDept} onChange={e => setProfDept(e.target.value)} placeholder="e.g. CSAIL"/>
              </div>
            </div>
            <div>
              <label className="label">Stage</label>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:6 }}>
                {STAGES.map(s => {
                  const active = stage === s.id;
                  const SI = Icon[s.icon];
                  return (
                    <button key={s.id} onClick={() => setStage(s.id)} style={{
                      display:'flex', alignItems:'center', gap:5, padding:'5px 12px',
                      borderRadius:999, fontSize:12, fontWeight:500, cursor:'pointer',
                      border:`1.5px solid ${active ? s.color : 'var(--line)'}`,
                      background: active ? s.bg : 'transparent',
                      color: active ? s.color : 'var(--ink-3)',
                      transition:'all 0.12s',
                    }}>
                      {SI && <SI size={11}/>} {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input textarea" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Research focus, contact history, any reminders…" rows={3}/>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--line)', display:'flex', justifyContent:'flex-end', gap:8, background:'var(--paper-2)', borderRadius:'0 0 var(--radius) var(--radius)' }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!profName.trim() || saving}
            style={{ minWidth:120, justifyContent:'center' }}>
            {saving ? 'Saving…' : editing ? 'Save changes' : `Add to ${activeStage?.label}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline Card ─────────────────────────────────────────────────────────────
function PipelineCard({ entry, stageColor, onEdit, onDelete, onDragStart, isDragging }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card"
      style={{
        padding: '11px 12px',
        marginBottom: 6,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.45 : 1,
        borderLeft: `3px solid ${stageColor}`,
        boxShadow: hovered && !isDragging
          ? '0 4px 12px -4px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)'
          : 'var(--shadow-1)',
        transform: hovered && !isDragging ? 'translateY(-1px)' : 'none',
        transition: 'box-shadow 0.15s, transform 0.15s, opacity 0.15s',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {/* Main content */}
      <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
        <Avatar name={entry.prof_name} size={28}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3, marginBottom: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {entry.prof_name}
          </div>
          {(entry.prof_affil || entry.prof_dept) && (
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {[entry.prof_affil, entry.prof_dept].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {entry.notes && (
        <div style={{
          marginTop: 8,
          padding: '6px 8px',
          borderRadius: 6,
          background: 'var(--paper-2)',
          fontSize: 11.5,
          color: 'var(--ink-3)',
          fontStyle: 'italic',
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {entry.notes}
        </div>
      )}

      {/* Footer */}
      <div className="row between" style={{ marginTop: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--ink-4)', fontVariantNumeric: 'tabular-nums' }}>
          {timeAgo(entry.updated_at)}
        </span>
        <div className="row gap-1" style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.12s' }}>
          <button
            className="btn btn-icon btn-ghost"
            style={{ width: 24, height: 24, borderRadius: 5, color: 'var(--ink-3)' }}
            onClick={e => { e.stopPropagation(); onEdit(entry); }}
            title="Edit"
          >
            <Icon.FileText size={11}/>
          </button>
          <button
            className="btn btn-icon btn-ghost"
            style={{ width: 24, height: 24, borderRadius: 5, color: 'var(--red)' }}
            onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
            title="Remove"
          >
            <Icon.Trash size={11}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({ stage, entries, isOver, onDragOver, onDrop, onDragLeave, onEdit, onDelete, onDragStart, dragId, onAddToStage }) {
  const SI = Icon[stage.icon];

  return (
    <div
      onDragOver={e => { e.preventDefault(); onDragOver(stage.id); }}
      onDrop={e => { e.preventDefault(); onDrop(stage.id); }}
      onDragLeave={onDragLeave}
      style={{
        width: 240,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: isOver ? stage.bg : 'var(--paper-2)',
        border: `1.5px solid ${isOver ? stage.color : 'var(--line)'}`,
        borderTop: `3px solid ${stage.color}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'background 0.15s, border-color 0.15s',
        minHeight: 320,
        maxHeight: 'calc(100vh - 220px)',
      }}
    >
      {/* Column header */}
      <div style={{ padding: '12px 14px 10px', flexShrink: 0 }}>
        <div className="row gap-2" style={{ marginBottom: 3 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: stage.bg, border: `1px solid ${stage.color}22`,
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            {SI && <SI size={13} color={stage.color}/>}
          </div>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)', flex: 1 }}>
            {stage.label}
          </span>
          <span style={{
            minWidth: 20, height: 20, padding: '0 6px',
            borderRadius: 999, background: entries.length > 0 ? stage.color : 'var(--line)',
            color: entries.length > 0 ? '#fff' : 'var(--ink-4)',
            fontSize: 11, fontWeight: 600,
            display: 'grid', placeItems: 'center',
            transition: 'background 0.2s',
          }}>
            {entries.length}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', paddingLeft: 34 }}>{stage.desc}</div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--line)', margin: '0 14px', flexShrink: 0 }}/>

      {/* Cards area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 4px' }}>
        {entries.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '24px 16px', color: 'var(--ink-4)', fontSize: 12,
            border: '1.5px dashed var(--line)',
            borderRadius: 8, margin: '4px 0',
            background: isOver ? stage.bg : 'transparent',
            transition: 'background 0.15s',
          }}>
            <div style={{ fontSize: 11, textAlign: 'center', lineHeight: 1.5 }}>
              {isOver ? `Drop here → ${stage.label}` : 'Drag a card here'}
            </div>
          </div>
        )}

        {entries.map(entry => (
          <PipelineCard
            key={entry.id}
            entry={entry}
            stageColor={stage.color}
            onEdit={onEdit}
            onDelete={onDelete}
            onDragStart={e => onDragStart(e, entry.id)}
            isDragging={dragId === entry.id}
          />
        ))}
      </div>

      {/* Column footer: add button */}
      <div style={{ padding: '8px 10px', flexShrink: 0, borderTop: '1px solid var(--line)' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'center', color: 'var(--ink-3)', fontSize: 12 }}
          onClick={() => onAddToStage(stage.id)}
        >
          <Icon.Plus size={11}/> Add to {stage.label}
        </button>
      </div>
    </div>
  );
}

// ─── Pipeline funnel strip ─────────────────────────────────────────────────────
function FunnelStrip({ entries }) {
  const counts = Object.fromEntries(STAGES.map(s => [s.id, entries.filter(e => e.stage === s.id).length]));
  const total = entries.length;
  if (total === 0) return null;
  return (
    <div className="row gap-1" style={{ alignItems: 'stretch' }}>
      {STAGES.map((s, i) => {
        const n = counts[s.id];
        const SI = Icon[s.icon];
        return (
          <React.Fragment key={s.id}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '6px 14px', borderRadius: 8,
              background: n > 0 ? s.bg : 'transparent',
              border: `1px solid ${n > 0 ? s.color + '30' : 'var(--line)'}`,
              transition: 'all 0.2s',
              minWidth: 70,
            }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: n > 0 ? s.color : 'var(--ink-4)', lineHeight: 1 }}>{n}</span>
              <span style={{ fontSize: 10, color: n > 0 ? s.color : 'var(--ink-4)', fontWeight: 500 }}>{s.label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{ display:'flex', alignItems:'center', color:'var(--ink-4)', fontSize:12 }}>
                <Icon.Chevron size={14}/>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Pipeline() {
  const [entries,     setEntries]     = useState([]);
  const [savedProfs,  setSavedProfs]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null); // null | { stage: 'saved' } | entry object
  const [dragId,      setDragId]      = useState(null);
  const [dragOver,    setDragOver]    = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { setLoading(false); return; }
    Promise.all([pipelineService.getAll(), savedService.getAll()])
      .then(([pe, se]) => {
        setEntries(pe.data.results || pe.data || []);
        const saved = se.data.results || se.data || [];
        setSavedProfs(saved.map(s => s.professor_details || s).filter(Boolean));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleAdd = async (data) => {
    const res = await pipelineService.create(data);
    setEntries(prev => [res.data, ...prev]);
    setModal(null);
  };

  const handleEdit = async (data) => {
    const res = await pipelineService.update(modal.id, data);
    setEntries(prev => prev.map(e => e.id === modal.id ? res.data : e));
    setModal(null);
  };

  const handleDelete = async (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    pipelineService.remove(id).catch(() => {});
  };

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const handleDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (targetStage) => {
    if (!dragId) return;
    const entry = entries.find(e => e.id === dragId);
    if (!entry || entry.stage === targetStage) { setDragId(null); setDragOver(null); return; }
    setEntries(prev => prev.map(e =>
      e.id === dragId ? { ...e, stage: targetStage, updated_at: new Date().toISOString() } : e
    ));
    pipelineService.update(dragId, { stage: targetStage }).catch(() => {});
    setDragId(null);
    setDragOver(null);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null);
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openAdd   = (stageId = 'saved') => setModal({ _new: true, stage: stageId });
  const openEdit  = (entry)             => setModal(entry);
  const isAdding  = modal?._new === true;
  const isEditing = modal && !modal._new;

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--ink-3)', gap:8 }}>
      <Icon.Kanban size={20}/> Loading pipeline…
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0, overflow:'hidden' }}>

      {/* ── Page header ── */}
      <div style={{ padding:'20px 24px 16px', flexShrink:0, borderBottom:'1px solid var(--line)', background:'white' }}>
        <div className="row between" style={{ marginBottom: entries.length > 0 ? 14 : 0 }}>
          <div className="col" style={{ gap:3 }}>
            <h2 style={{ margin:0, fontSize:18, fontWeight:700, letterSpacing:'-0.025em' }}>
              Application Pipeline
            </h2>
            <div style={{ fontSize:12.5, color:'var(--ink-3)' }}>
              Drag professors between stages as your application progresses
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => openAdd()}>
            <Icon.Plus size={13}/> Add Professor
          </button>
        </div>
        {entries.length > 0 && <FunnelStrip entries={entries}/>}
      </div>

      {/* ── Board ── */}
      <div style={{
        flex:1, overflowX:'auto', overflowY:'hidden',
        display:'flex', alignItems:'flex-start', gap:12,
        padding:'20px 24px',
      }}>
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            entries={entries.filter(e => e.stage === stage.id)}
            isOver={dragOver === stage.id}
            dragId={dragId}
            onDragStart={handleDragStart}
            onDragOver={setDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onEdit={openEdit}
            onDelete={handleDelete}
            onAddToStage={openAdd}
          />
        ))}
      </div>

      {/* ── Modals ── */}
      {(isAdding || isEditing) && (
        <EntryModal
          entry={isEditing ? modal : undefined}
          defaultStage={isAdding ? modal.stage : undefined}
          savedProfs={savedProfs}
          onSave={isAdding ? handleAdd : handleEdit}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
