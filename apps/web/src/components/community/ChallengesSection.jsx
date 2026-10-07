/**
 * ChallengesSection — Production Challenge Platform
 * Slot: Community.jsx → "Challenges & Stakes" tab (line 671)
 * Import path: '@/components/community/ChallengesSection'
 *
 * Hooks used (no conflict with Community feed/groups/messages state):
 *   useChallenges  → Supabase-backed + guest localStorage fallback
 *   challengeNLU   → Real NLU parser (no setTimeout keyword tricks)
 *   useAuth        → reads user only
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Icons from 'lucide-react';
import { useChallenges } from '@/hooks/useChallenges';
import { useAuth } from '@/context/AuthContext';
import {
  parseChallenge,
  getVerificationLabel,
  CATEGORY_META,
  MODE_META,
} from '@/features/challenges/challengeNLU';
import { showToast } from '@/lib/utils';

// ─── STATIC LOOKUPS ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',               label: 'All',          icon: 'Sparkles'    },
  { id: 'physical',          label: 'Physical',     icon: 'Dumbbell'    },
  { id: 'sleep',             label: 'Sleep',        icon: 'Moon'        },
  { id: 'digital_wellbeing', label: 'Screen Time',  icon: 'Smartphone'  },
  { id: 'hydration',         label: 'Hydration',    icon: 'Droplets'    },
  { id: 'habits',            label: 'Habits',       icon: 'BookOpen'    },
  { id: 'nura_360',          label: 'Nura 360',     icon: 'Star'        },
];

const PAY_METHODS = [
  { id: 'telebirr', label: 'Telebirr', emoji: '📱' },
  { id: 'cbe',      label: 'CBE Birr', emoji: '🏦' },
];

// ─── TINY SHARED HELPERS ──────────────────────────────────────────────────────
function DynIcon({ name, size = 16, color, style: s }) {
  const C = Icons[name];
  return C ? <C size={size} color={color} style={s} /> : null;
}

function VerifBadge({ method }) {
  const v = getVerificationLabel(method || 'self_reported');
  const palette = {
    device:        { bg: 'rgba(2,132,199,.12)',   fg: '#0284c7' },
    camera:        { bg: 'rgba(22,163,74,.12)',   fg: '#16a34a' },
    location:      { bg: 'rgba(147,51,234,.12)',  fg: '#9333ea' },
    mutual:        { bg: 'rgba(234,88,12,.12)',   fg: '#ea580c' },
    evidence:      { bg: 'rgba(202,138,4,.12)',   fg: '#ca8a04' },
    self_reported: { bg: 'rgba(100,116,139,.12)', fg: '#64748b' },
  };
  const c = palette[method] || palette.self_reported;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      background: c.bg, color: c.fg,
      padding:'3px 8px', borderRadius:8, fontSize:11, fontWeight:700,
    }}>
      {v.icon} {v.label}
    </span>
  );
}

// Generic overlay modal — closes on Escape or backdrop click
function Modal({ onClose, children, maxWidth = 560 }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,.62)',
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:1200, padding:16,
      }}
    >
      <div style={{
        background:'var(--white,#fff)', borderRadius:20, width:'100%',
        maxWidth, maxHeight:'92vh', overflowY:'auto',
        border:'1px solid var(--border)',
        boxShadow:'0 24px 60px rgba(0,0,0,.18)',
      }}>
        {children}
      </div>
    </div>
  );
}

function ModalHead({ title, sub, onClose }) {
  return (
    <div style={{
      padding:'20px 24px 0', display:'flex',
      justifyContent:'space-between', alignItems:'flex-start', marginBottom:18,
    }}>
      <div>
        <div style={{ fontWeight:800, fontSize:18 }}>{title}</div>
        {sub && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{sub}</div>}
      </div>
      <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', padding:4 }}>
        <Icons.X size={20} color="var(--text-muted)" />
      </button>
    </div>
  );
}

// ─── CHALLENGE CARD ───────────────────────────────────────────────────────────
function ChallengeCard({ ch, isJoined, participation, onOpen, onJoin, onLeave, joiningId }) {
  const days     = participation?.completed_days?.length || 0;
  const streak   = participation?.streak || 0;
  const pct      = Math.round((days / (ch.duration_days || 7)) * 100);
  const busy     = joiningId === ch.id;

  return (
    <div
      onClick={() => onOpen(ch)}
      style={{
        background:'var(--white,#fff)', border:'1.5px solid var(--border)',
        borderRadius:18, overflow:'hidden', cursor:'pointer',
        display:'flex', flexDirection:'column',
        boxShadow:'0 2px 10px rgba(0,0,0,.05)',
        transition:'transform .15s, box-shadow .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.10)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,.05)'; }}
    >
      {/* Hero image */}
      <div style={{ position:'relative', height:140, background:'#0f172a', flexShrink:0 }}>
        <img
          src={ch.image_url}
          alt={ch.title}
          style={{ width:'100%', height:'100%', objectFit:'cover' }}
          onError={e => { e.target.src='https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80'; }}
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,.72) 100%)' }} />

        {/* Top row badges */}
        <div style={{ position:'absolute', top:10, left:10, right:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <VerifBadge method={ch.verification_method} />
          {ch.is_monetary
            ? <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#16a34a', color:'#fff', padding:'3px 8px', borderRadius:8, fontSize:11, fontWeight:800 }}><Icons.Trophy size={11} /> {(ch.prize_pool||0).toLocaleString()} ETB</span>
            : <span style={{ background:'rgba(255,255,255,.2)', color:'#fff', padding:'3px 8px', borderRadius:8, fontSize:11, fontWeight:700, backdropFilter:'blur(4px)' }}>🆓 Free</span>
          }
        </div>

        {isJoined && (
          <div style={{ position:'absolute', top:38, left:'50%', transform:'translateX(-50%)', background:'rgba(22,163,74,.9)', color:'#fff', fontSize:10, fontWeight:800, padding:'2px 10px', borderRadius:20 }}>✓ JOINED</div>
        )}

        {/* Title strip */}
        <div style={{ position:'absolute', bottom:10, left:12, right:12 }}>
          <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:.8, color:'#4ade80', fontWeight:800 }}>
            {(CATEGORY_META[ch.category]?.label || ch.category).replace('_',' ')}
          </div>
          <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textShadow:'0 1px 3px rgba(0,0,0,.7)' }}>
            {ch.title}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'12px 14px', flex:1, display:'flex', flexDirection:'column', gap:10 }}>
        <p style={{ fontSize:12, color:'var(--text-muted)', margin:0, lineHeight:1.45, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {ch.description}
        </p>

        <div style={{ display:'flex', gap:10, fontSize:11, color:'var(--text-muted)', flexWrap:'wrap' }}>
          <span style={{ display:'flex', alignItems:'center', gap:3 }}><Icons.Users size={11} color="var(--green)" /> {(ch.participant_count||0).toLocaleString()}</span>
          <span style={{ display:'flex', alignItems:'center', gap:3 }}><Icons.Clock size={11} /> {ch.duration_days}d</span>
          <span style={{ display:'flex', alignItems:'center', gap:3 }}><Icons.BarChart2 size={11} /> {ch.difficulty}</span>
          {isJoined && streak > 0 && <span style={{ display:'flex', alignItems:'center', gap:3, color:'#ea580c', fontWeight:700 }}><Icons.Flame size={11} /> {streak}d</span>}
        </div>

        {isJoined && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>
              <span>Day {days} / {ch.duration_days}</span>
              <span>{pct}%</span>
            </div>
            <div style={{ height:5, background:'var(--bg)', borderRadius:4, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:'var(--green)', borderRadius:4, transition:'width .4s' }} />
            </div>
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border)', paddingTop:10, marginTop:'auto' }}>
          <span style={{ fontSize:11, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:3 }}>
            <DynIcon name={MODE_META[ch.mode]?.icon || 'Users'} size={11} />
            {MODE_META[ch.mode]?.label || ch.mode}
          </span>
          <button
            onClick={e => { e.stopPropagation(); isJoined ? onLeave(ch) : onJoin(ch); }}
            disabled={busy}
            style={{
              background: isJoined ? 'rgba(22,163,74,.1)' : 'var(--green)',
              color: isJoined ? 'var(--green)' : '#fff',
              border: isJoined ? '1px solid rgba(22,163,74,.3)' : 'none',
              padding:'6px 12px', borderRadius:8, fontWeight:800, fontSize:12,
              cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? .7 : 1,
            }}
          >
            {busy ? '...' : isJoined ? 'Joined ✓' : ch.is_monetary ? `Stake ${ch.entry_fee} ETB` : 'Join Free'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CHALLENGE DETAIL MODAL ───────────────────────────────────────────────────
function DetailModal({ ch, participation, isJoined, onClose, onJoin, onLeave, getLeaderboard, getChallengeEvents, joiningId }) {
  const [tab, setTab]   = useState('overview');
  const [lb, setLb]     = useState([]);
  const [ev, setEv]     = useState([]);
  const [lbLoad, setLbLoad] = useState(false);

  useEffect(() => {
    if (tab === 'leaderboard') { setLbLoad(true); getLeaderboard(ch.id).then(d => { setLb(d||[]); setLbLoad(false); }); }
    if (tab === 'activity')    { getChallengeEvents(ch.id).then(d => setEv(d||[])); }
  }, [tab, ch.id]);

  const days = participation?.completed_days?.length || 0;
  const pct  = Math.round((days / (ch.duration_days||7)) * 100);
  const pool = ch.is_monetary ? {
    gross:    ch.gross_pool || 0,
    platform: (ch.gross_pool||0) * (ch.platform_fee_pct||10) / 100,
    creator:  (ch.gross_pool||0) * (ch.creator_reward_pct||2)  / 100,
    prize:    ch.prize_pool || 0,
  } : null;

  const TABS = ['overview','objectives', ...(ch.is_monetary?['financials']:[]), 'leaderboard','activity'];

  return (
    <Modal onClose={onClose} maxWidth={640}>
      {/* Hero */}
      <div style={{ position:'relative', height:180, background:'#0f172a', borderRadius:'20px 20px 0 0', overflow:'hidden' }}>
        <img src={ch.image_url} alt={ch.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.src='https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80'; }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,0,0,.1) 0%,rgba(0,0,0,.8) 100%)' }} />
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'rgba(0,0,0,.5)', border:'none', borderRadius:20, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <Icons.X size={16} color="#fff" />
        </button>
        <div style={{ position:'absolute', bottom:14, left:16, right:16 }}>
          <div style={{ fontSize:11, color:'#4ade80', fontWeight:800, textTransform:'uppercase', letterSpacing:.8 }}>{CATEGORY_META[ch.category]?.label || ch.category}</div>
          <h2 style={{ margin:'4px 0 0', fontSize:20, fontWeight:800, color:'#fff', textShadow:'0 1px 4px rgba(0,0,0,.6)' }}>{ch.title}</h2>
        </div>
      </div>

      <div style={{ padding:'0 24px 24px' }}>
        {/* Quick stats */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
          {[
            { val:(ch.participant_count||0).toLocaleString(), label:'Participants' },
            { val:`${ch.duration_days}d`,                     label:'Duration'     },
            { val:ch.difficulty,                              label:'Difficulty'   },
            { val:ch.xp_reward,                               label:'XP Reward'    },
          ].map(s=>(
            <div key={s.label} style={{ textAlign:'center', flex:1, minWidth:55 }}>
              <div style={{ fontSize:16, fontWeight:800 }}>{s.val}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:4, margin:'16px 0', background:'var(--bg)', borderRadius:12, padding:4 }}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1, padding:'8px 4px', borderRadius:8, border:'none',
              background: tab===t ? 'var(--white,#fff)' : 'transparent',
              color: tab===t ? 'var(--green)' : 'var(--text-muted)',
              fontWeight: tab===t ? 700 : 500, fontSize:12, cursor:'pointer',
              boxShadow: tab===t ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
            }}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {/* My progress bar */}
        {isJoined && (
          <div style={{ background:'rgba(22,163,74,.06)', border:'1px solid rgba(22,163,74,.2)', borderRadius:12, padding:'12px 16px', marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:8, color:'var(--green)' }}>My Progress</div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>
              <span>Day {days} / {ch.duration_days}</span>
              <span style={{ color:'#ea580c', fontWeight:700 }}><Icons.Flame size={12} style={{ verticalAlign:'middle' }}/> {participation?.streak||0}d streak</span>
            </div>
            <div style={{ height:8, background:'var(--bg)', borderRadius:4, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:'var(--green)', borderRadius:4 }} />
            </div>
          </div>
        )}

        {/* ── TAB: OVERVIEW ── */}
        {tab==='overview' && (
          <div>
            <p style={{ fontSize:14, lineHeight:1.6, color:'var(--text)', margin:'0 0 16px' }}>{ch.description}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
              <VerifBadge method={ch.verification_method} />
              <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'var(--bg)', color:'var(--text-muted)', padding:'3px 8px', borderRadius:8, fontSize:11, fontWeight:700 }}>
                <DynIcon name={MODE_META[ch.mode]?.icon||'Users'} size={11}/> {MODE_META[ch.mode]?.label||ch.mode}
              </span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'var(--bg)', color:'var(--text-muted)', padding:'3px 8px', borderRadius:8, fontSize:11, fontWeight:700 }}>
                <Icons.Star size={11}/> {ch.xp_reward} XP
              </span>
            </div>
            <div style={{ background:'#fffbeb', border:'1px solid #fef3c7', borderRadius:10, padding:12, fontSize:12, color:'#92400e', lineHeight:1.5 }}>
              ⚠️ <strong>Anti-Cheat Active.</strong> All progress is verified before counting toward the leaderboard. Suspicious patterns are flagged automatically.
            </div>
          </div>
        )}

        {/* ── TAB: OBJECTIVES ── */}
        {tab==='objectives' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {(ch.objectives||[]).length===0
              ? <div style={{ color:'var(--text-muted)', textAlign:'center', padding:24, fontSize:13 }}>No objectives defined.</div>
              : (ch.objectives||[]).map((obj,i)=>{
                  const vl = getVerificationLabel(obj.verification_method);
                  return (
                    <div key={obj.id||i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:14, background:'var(--bg)', borderRadius:12, border:'1px solid var(--border)' }}>
                      <div style={{ width:32, height:32, borderRadius:10, background:'var(--green-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>{vl.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13 }}>{obj.label}</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
                          Target: <strong>{typeof obj.target==='number' ? obj.target.toLocaleString() : obj.target} {obj.unit}</strong>
                          {' · '}{vl.label}
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* ── TAB: FINANCIALS ── */}
        {tab==='financials' && pool && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'Entry Fee',           val:`${ch.entry_fee} ETB`,              color:'#64748b' },
                { label:'Gross Pool',          val:`${pool.gross.toLocaleString()} ETB`, color:'#0284c7' },
                { label:'Platform Fee (10%)',  val:`${pool.platform.toFixed(2)} ETB`,   color:'#64748b' },
                { label:'Creator Reward (2%)', val:`${pool.creator.toFixed(2)} ETB`,    color:'#ca8a04' },
              ].map(s=>(
                <div key={s.label} style={{ padding:14, background:'var(--bg)', borderRadius:12, border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:16, fontWeight:800, color:s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:16, background:'rgba(22,163,74,.08)', border:'1.5px solid rgba(22,163,74,.25)', borderRadius:14 }}>
              <div style={{ fontSize:12, color:'var(--green)', fontWeight:700, marginBottom:4 }}>🏆 Verified Winner Prize Pool (88%)</div>
              <div style={{ fontSize:28, fontWeight:900, color:'var(--green)' }}>{pool.prize.toLocaleString()} ETB</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Distributed equally among all verified completers</div>
            </div>
            <div style={{ background:'#fffbeb', border:'1px solid #fef3c7', borderRadius:10, padding:12, fontSize:12, color:'#92400e' }}>
              💰 Stakes held in escrow. Payouts sent directly to your wallet at challenge close.
            </div>
          </div>
        )}

        {/* ── TAB: LEADERBOARD ── */}
        {tab==='leaderboard' && (
          lbLoad
            ? <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}><Icons.Loader size={22} style={{ animation:'spin 1s linear infinite' }}/></div>
            : lb.length===0
              ? <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)', fontSize:13 }}>No participants yet. Be first!</div>
              : <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {lb.slice(0,20).map((p,i)=>(
                    <div key={p.user_id||i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:i<3?'rgba(22,163,74,.06)':'var(--bg)', borderRadius:12, border:`1px solid ${i<3?'rgba(22,163,74,.2)':'var(--border)'}` }}>
                      <div style={{ width:28, height:28, borderRadius:14, background:i===0?'#fbbf24':i===1?'#94a3b8':i===2?'#b45309':'var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:i<3?'#fff':'var(--text-muted)', flexShrink:0 }}>
                        {i+1}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13 }}>
                          {p.user_id==='guest'?'You':`Participant #${i+1}`}
                        </div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                          {p.completed_days?.length||0}d done · {p.streak||0}d streak
                        </div>
                      </div>
                      <div style={{ fontWeight:800, fontSize:13, color:'var(--green)' }}>
                        {Math.round(((p.completed_days?.length||0)/(ch.duration_days||7))*100)}%
                      </div>
                    </div>
                  ))}
                </div>
        )}

        {/* ── TAB: ACTIVITY ── */}
        {tab==='activity' && (
          ev.length===0
            ? <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)', fontSize:13 }}>No activity yet. Join and log your first day!</div>
            : <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {ev.map((e,i)=>(
                  <div key={e.id||i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <div style={{ width:8, height:8, borderRadius:4, background:'var(--green)', marginTop:5, flexShrink:0 }}/>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{e.title}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{new Date(e.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
        )}

        {/* CTA */}
        <div style={{ marginTop:20, display:'flex', gap:10 }}>
          {!isJoined
            ? <button onClick={()=>onJoin(ch)} disabled={joiningId===ch.id} className="btn-primary" style={{ flex:1, padding:'14px', fontSize:15, fontWeight:800, opacity:joiningId===ch.id?.7:1 }}>
                {joiningId===ch.id?'Joining…':ch.is_monetary?`💰 Stake ${ch.entry_fee} ETB & Join`:'🏃 Join Free'}
              </button>
            : <>
                <button onClick={onClose} className="btn-primary" style={{ flex:1, padding:'14px', fontSize:14, fontWeight:700 }}>
                  <Icons.CheckCircle size={16} style={{ verticalAlign:'middle', marginRight:6 }}/> Log Today
                </button>
                <button onClick={()=>onLeave(ch)} style={{ padding:'14px 16px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12, cursor:'pointer', color:'var(--text-muted)', fontSize:13, fontWeight:600 }}>
                  Leave
                </button>
              </>
          }
        </div>
      </div>
    </Modal>
  );
}

// ─── NURA AI BUILDER MODAL ────────────────────────────────────────────────────
function NuraModal({ onClose, onCreate }) {
  const [prompt, setPrompt]   = useState('');
  const [msgs, setMsgs]       = useState([
    { id:'m0', from:'nura', text:"Hi! I'm Nura 👋 Describe your goal — I'll build a verifiable challenge with the right rules and verification." },
  ]);
  const [parsed, setParsed]   = useState(null);
  const [busy, setBusy]       = useState(false);
  const scrollRef             = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs]);

  function send() {
    const text = prompt.trim();
    if (!text) return;
    setMsgs(prev=>[...prev,{ id:'u'+Date.now(), from:'user', text }]);
    setPrompt('');
    setParsed(null);

    setTimeout(()=>{
      const r = parseChallenge(text);
      if (r.type==='UNMEASURABLE') {
        setMsgs(prev=>[...prev,{ id:'n'+Date.now(), from:'nura', text:`"${r.term}" isn't directly measurable for a fair competition.\n\n💡 I can build this instead:\n"${r.suggestion}"\n\nShould I create that?` }]);
      } else if (r.type==='DANGEROUS') {
        setMsgs(prev=>[...prev,{ id:'n'+Date.now(), from:'nura', text:r.suggestion }]);
      } else if (r.type==='TOO_VAGUE') {
        setMsgs(prev=>[...prev,{ id:'n'+Date.now(), from:'nura', text:r.suggestion }]);
      } else {
        setParsed(r);
        setMsgs(prev=>[...prev,{ id:'n'+Date.now(), from:'nura', text:`Here's what I built:\n\n${r.summary}\n\nTap **Create Challenge** to launch it.` }]);
      }
    }, 380);
  }

  async function launch() {
    if (!parsed) return;
    setBusy(true);
    const res = await onCreate(parsed.definition);
    setBusy(false);
    if (res.success) { showToast(`✅ "${parsed.definition.title}" is live!`,'success'); onClose(); }
    else showToast(res.error||'Failed','error');
  }

  return (
    <Modal onClose={onClose} maxWidth={580}>
      <ModalHead title="Nura AI Challenge Builder" sub="Describe any goal — Nura does the rest" onClose={onClose} />
      <div style={{ padding:'0 24px 24px' }}>
        {/* Chat */}
        <div ref={scrollRef} style={{ background:'var(--bg)', borderRadius:14, padding:14, height:280, overflowY:'auto', display:'flex', flexDirection:'column', gap:12, marginBottom:14 }}>
          {msgs.map(m=>(
            <div key={m.id} style={{ display:'flex', gap:10, flexDirection:m.from==='user'?'row-reverse':'row' }}>
              {m.from==='nura' && (
                <div style={{ width:32, height:32, borderRadius:16, background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icons.Sparkles size={16} color="#fff"/>
                </div>
              )}
              <div style={{
                maxWidth:'80%', padding:'10px 14px', borderRadius:14,
                borderTopLeftRadius: m.from==='nura'?4:14,
                borderTopRightRadius: m.from==='user'?4:14,
                background: m.from==='nura'?'var(--white,#fff)':'var(--green)',
                color: m.from==='user'?'#fff':'var(--text)',
                fontSize:13, lineHeight:1.5, whiteSpace:'pre-wrap',
                border: m.from==='nura'?'1px solid var(--border)':'none',
              }}>
                {m.text.replace(/\*\*(.*?)\*\*/g,'$1')}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ display:'flex', gap:10, marginBottom:parsed?16:0 }}>
          <input
            value={prompt}
            onChange={e=>setPrompt(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
            placeholder='"7-day run 5km + 30 push-ups, me & Michael, 100 ETB stake"'
            style={{ flex:1, padding:'11px 16px', borderRadius:12, border:'1px solid var(--border)', fontSize:13, outline:'none' }}
          />
          <button onClick={send} style={{ background:'var(--green)', color:'#fff', border:'none', borderRadius:12, padding:'11px 16px', cursor:'pointer', fontWeight:700 }}>
            <Icons.Send size={16}/>
          </button>
        </div>

        {/* Parsed preview */}
        {parsed && (
          <div style={{ background:'rgba(22,163,74,.06)', border:'1.5px solid rgba(22,163,74,.25)', borderRadius:14, padding:16, marginBottom:12 }}>
            <div style={{ fontWeight:800, fontSize:15, marginBottom:10 }}>{parsed.definition.title}</div>
            {parsed.definition.objectives.map((o,i)=>{
              const vl = getVerificationLabel(o.verification_method);
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, marginBottom:5 }}>
                  <span>{vl.icon}</span>
                  <span style={{ fontWeight:600 }}>{o.label}</span>
                  <span style={{ fontSize:11, color:'var(--text-muted)' }}>· {vl.label}</span>
                </div>
              );
            })}
            <div style={{ display:'flex', gap:16, marginTop:12, fontSize:12, color:'var(--text-muted)' }}>
              <span>⏱ {parsed.definition.duration_days}d</span>
              <span>👥 {parsed.definition.mode}</span>
              {parsed.definition.is_monetary ? <span>💰 {parsed.definition.entry_fee} ETB</span> : <span>🆓 Free</span>}
            </div>
            <button onClick={launch} disabled={busy} className="btn-primary" style={{ width:'100%', marginTop:14, padding:13, fontSize:14, fontWeight:800, opacity:busy?.7:1 }}>
              {busy?'Creating…':'🚀 Create Challenge'}
            </button>
          </div>
        )}

        {/* Example chips */}
        {!parsed && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:10 }}>
            {['7-day 5km GPS run','30 push-ups daily 14 days','Under 45min Instagram 10 days','3L water 2 weeks','Me and Abel: gym + 100 ETB stake'].map(ex=>(
              <button key={ex} onClick={()=>setPrompt(ex)} style={{ fontSize:11, padding:'5px 10px', borderRadius:20, border:'1px solid var(--border)', background:'var(--bg)', cursor:'pointer', color:'var(--text-muted)' }}>
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── MANUAL CREATE MODAL ──────────────────────────────────────────────────────
function ManualModal({ onClose, onCreate }) {
  const [title,    setTitle]    = useState('');
  const [desc,     setDesc]     = useState('');
  const [cat,      setCat]      = useState('physical');
  const [mode,     setMode]     = useState('group');
  const [dur,      setDur]      = useState(7);
  const [verif,    setVerif]    = useState('device');
  const [monetary, setMonetary] = useState(false);
  const [fee,      setFee]      = useState('100');
  const [busy,     setBusy]     = useState(false);
  const [err,      setErr]      = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!title.trim()) { setErr('Title is required.'); return; }
    setErr(''); setBusy(true);
    const entryFee = monetary ? (parseFloat(fee)||100) : 0;
    const res = await onCreate({
      title: title.trim(),
      description: desc.trim() || `${dur}-day ${cat} challenge`,
      category: cat, mode, duration_days: dur,
      is_monetary: monetary, entry_fee: entryFee,
      verification_method: verif,
      objectives:[{ id:'o_main', label:title.trim(), type:'generic', target:1, unit:'session', verification_method:verif }],
    });
    setBusy(false);
    if (res.success) { showToast(`✅ "${title}" created!`,'success'); onClose(); }
    else setErr(res.error||'Creation failed');
  }

  return (
    <Modal onClose={onClose} maxWidth={520}>
      <ModalHead title="Create Challenge" sub="Configure your challenge manually" onClose={onClose} />
      <form onSubmit={submit} style={{ padding:'0 24px 24px', display:'flex', flexDirection:'column', gap:14 }}>
        {err && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'10px 14px', color:'#dc2626', fontSize:13 }}>{err}</div>}

        <div>
          <label style={{ fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>Title *</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. 30-Day Morning Run" style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:'1px solid var(--border)', fontSize:14, boxSizing:'border-box' }}/>
        </div>

        <div>
          <label style={{ fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>Description</label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} placeholder="What will participants do each day?" style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:'1px solid var(--border)', fontSize:13, resize:'vertical', boxSizing:'border-box' }}/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>Category</label>
            <select value={cat} onChange={e=>setCat(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:'1px solid var(--border)', fontSize:13 }}>
              {Object.entries(CATEGORY_META).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>Mode</label>
            <select value={mode} onChange={e=>setMode(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:'1px solid var(--border)', fontSize:13 }}>
              {Object.entries(MODE_META).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>Duration (days)</label>
            <input type="number" min={1} max={90} value={dur} onChange={e=>setDur(parseInt(e.target.value)||7)} style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:'1px solid var(--border)', fontSize:13, boxSizing:'border-box' }}/>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>Verification</label>
            <select value={verif} onChange={e=>setVerif(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:'1px solid var(--border)', fontSize:13 }}>
              <option value="device">📱 Device</option>
              <option value="camera">📷 Camera</option>
              <option value="location">📍 Location</option>
              <option value="evidence">📸 Evidence</option>
              <option value="self_reported">✅ Self-Reported</option>
            </select>
          </div>
        </div>

        <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 16px' }}>
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
            <input type="checkbox" checked={monetary} onChange={e=>setMonetary(e.target.checked)} style={{ width:18, height:18, accentColor:'var(--green)' }}/>
            <div>
              <div style={{ fontWeight:700, fontSize:13 }}>💰 Staked (ETB prize pool)</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>Participants put money at stake. Winners share the prize pool.</div>
            </div>
          </label>
          {monetary && (
            <div style={{ marginTop:12 }}>
              <label style={{ fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>Entry Fee (ETB)</label>
              <input type="number" min={10} value={fee} onChange={e=>setFee(e.target.value)} style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:'1px solid var(--border)', fontSize:14, boxSizing:'border-box' }}/>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>Platform 10% · Creator 2% · Prize pool 88%</div>
            </div>
          )}
        </div>

        <button type="submit" disabled={busy} className="btn-primary" style={{ padding:14, fontSize:15, fontWeight:800, opacity:busy?.7:1 }}>
          {busy?'Creating…':'✅ Create Challenge'}
        </button>
      </form>
    </Modal>
  );
}

// ─── WALLET MODAL ─────────────────────────────────────────────────────────────
function WalletModal({ wallet:w, transactions:txns, onClose, onDeposit, onWithdraw }) {
  const [tab,     setTab]     = useState('balance');
  const [amount,  setAmount]  = useState('100');
  const [method,  setMethod]  = useState('telebirr');
  const [account, setAccount] = useState('');
  const [busy,    setBusy]    = useState(false);
  const [err,     setErr]     = useState('');

  const bal = w?.withdrawable_balance || 0;

  async function doDeposit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt||amt<=0) { setErr('Enter a valid amount'); return; }
    setBusy(true); setErr('');
    const res = await onDeposit(amt, method);
    setBusy(false);
    if (res.success) { showToast(`Deposited ${amt} ETB`,'success'); setTab('balance'); }
    else setErr(res.error||'Deposit failed');
  }

  async function doWithdraw(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt||amt<=0) { setErr('Enter a valid amount'); return; }
    setBusy(true); setErr('');
    const res = await onWithdraw(amt, method, account);
    setBusy(false);
    if (res.success) { showToast(`Withdrew ${amt} ETB`,'success'); setTab('balance'); }
    else setErr(res.error||'Withdrawal failed');
  }

  return (
    <Modal onClose={onClose} maxWidth={460}>
      <ModalHead title="Challenge Wallet" sub="ETB balances · deposits · withdrawals" onClose={onClose}/>
      <div style={{ padding:'0 24px 24px' }}>
        <div style={{ display:'flex', background:'var(--bg)', borderRadius:12, padding:4, gap:4, marginBottom:18 }}>
          {['balance','deposit','withdraw','history'].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setErr('');}} style={{ flex:1, padding:'8px 4px', borderRadius:8, border:'none', background:tab===t?'var(--white,#fff)':'transparent', color:tab===t?'var(--green)':'var(--text-muted)', fontWeight:tab===t?700:500, fontSize:12, cursor:'pointer' }}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {err && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'10px 14px', color:'#dc2626', fontSize:13, marginBottom:14 }}>{err}</div>}

        {/* BALANCE */}
        {tab==='balance' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:'linear-gradient(135deg,#065f46,#059669)', borderRadius:16, padding:'20px 22px', color:'#fff' }}>
              <div style={{ fontSize:12, opacity:.8, marginBottom:4 }}>Withdrawable Balance</div>
              <div style={{ fontSize:32, fontWeight:900 }}>{bal.toFixed(2)} ETB</div>
              <div style={{ display:'flex', gap:16, marginTop:12, fontSize:12, opacity:.85 }}>
                <span>🏆 {(w?.challenge_winnings||0).toFixed(2)} won</span>
                <span>⭐ {w?.nura_points||0} pts</span>
                <span>⚡ {w?.xp||0} XP</span>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'Winnings',       val:`${(w?.challenge_winnings||0).toFixed(2)} ETB`, color:'#16a34a' },
                { label:'Creator Rewards',val:`${(w?.creator_rewards||0).toFixed(2)} ETB`,    color:'#ca8a04' },
                { label:'Nura Points',    val:`${w?.nura_points||0} pts`,                     color:'#7c3aed' },
                { label:'XP Earned',      val:`${w?.xp||0} XP`,                               color:'#0284c7' },
              ].map(s=>(
                <div key={s.label} style={{ padding:'12px 14px', background:'var(--bg)', borderRadius:12, border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:17, fontWeight:800, color:s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setTab('deposit')} className="btn-primary" style={{ flex:1, padding:12, fontWeight:700 }}>+ Deposit ETB</button>
              <button onClick={()=>setTab('withdraw')} style={{ flex:1, padding:12, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12, cursor:'pointer', fontWeight:700, fontSize:14 }}>Withdraw</button>
            </div>
          </div>
        )}

        {/* DEPOSIT */}
        {tab==='deposit' && (
          <form onSubmit={doDeposit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'#fffbeb', border:'1px solid #fef3c7', borderRadius:10, padding:12, fontSize:12, color:'#92400e' }}>
              💡 Triggers a real Telebirr / CBE Birr payment in production. Balance updates after gateway confirmation.
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>Amount (ETB)</label>
              <input type="number" min={10} value={amount} onChange={e=>setAmount(e.target.value)} style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1px solid var(--border)', fontSize:16, fontWeight:700, boxSizing:'border-box' }}/>
              <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
                {[50,100,200,500].map(v=><button key={v} type="button" onClick={()=>setAmount(String(v))} style={{ padding:'5px 12px', borderRadius:20, border:'1px solid var(--border)', background:amount===String(v)?'var(--green)':'var(--bg)', color:amount===String(v)?'#fff':'var(--text-muted)', fontSize:12, cursor:'pointer', fontWeight:600 }}>{v} ETB</button>)}
              </div>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700, display:'block', marginBottom:8 }}>Payment Method</label>
              <div style={{ display:'flex', gap:10 }}>
                {PAY_METHODS.map(pm=>(
                  <label key={pm.id} style={{ flex:1, display:'flex', alignItems:'center', gap:8, padding:'12px 14px', borderRadius:12, border:`1.5px solid ${method===pm.id?'var(--green)':'var(--border)'}`, background:method===pm.id?'rgba(22,163,74,.06)':'var(--bg)', cursor:'pointer' }}>
                    <input type="radio" name="depM" checked={method===pm.id} onChange={()=>setMethod(pm.id)} style={{ accentColor:'var(--green)' }}/>
                    <span style={{ fontSize:18 }}>{pm.emoji}</span>
                    <span style={{ fontWeight:700, fontSize:13 }}>{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={busy} className="btn-primary" style={{ padding:13, fontSize:15, fontWeight:800 }}>
              {busy?'Processing…':`Deposit ${amount||0} ETB`}
            </button>
          </form>
        )}

        {/* WITHDRAW */}
        {tab==='withdraw' && (
          <form onSubmit={doWithdraw} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'rgba(22,163,74,.06)', border:'1px solid rgba(22,163,74,.2)', borderRadius:10, padding:12, fontSize:13 }}>
              Available: <strong>{bal.toFixed(2)} ETB</strong>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>Amount (ETB)</label>
              <input type="number" min={10} max={bal} value={amount} onChange={e=>setAmount(e.target.value)} style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1px solid var(--border)', fontSize:16, fontWeight:700, boxSizing:'border-box' }}/>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700, display:'block', marginBottom:8 }}>Withdraw to</label>
              <div style={{ display:'flex', gap:10 }}>
                {PAY_METHODS.map(pm=>(
                  <label key={pm.id} style={{ flex:1, display:'flex', alignItems:'center', gap:8, padding:'12px 14px', borderRadius:12, border:`1.5px solid ${method===pm.id?'var(--green)':'var(--border)'}`, background:method===pm.id?'rgba(22,163,74,.06)':'var(--bg)', cursor:'pointer' }}>
                    <input type="radio" name="wdM" checked={method===pm.id} onChange={()=>setMethod(pm.id)} style={{ accentColor:'var(--green)' }}/>
                    <span>{pm.emoji}</span>
                    <span style={{ fontWeight:700, fontSize:13 }}>{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:700, display:'block', marginBottom:6 }}>Account Number</label>
              <input value={account} onChange={e=>setAccount(e.target.value)} placeholder="e.g. 0911234567" style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1px solid var(--border)', fontSize:14, boxSizing:'border-box' }}/>
            </div>
            <button type="submit" disabled={busy} className="btn-primary" style={{ padding:13, fontSize:15, fontWeight:800 }}>
              {busy?'Processing…':`Withdraw ${amount||0} ETB`}
            </button>
          </form>
        )}

        {/* HISTORY */}
        {tab==='history' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {(!txns||txns.length===0)
              ? <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)', fontSize:13 }}>No transactions yet.</div>
              : txns.slice(0,30).map((tx,i)=>{
                  const credit = ['deposit','payout','creator_reward','points_credit'].includes(tx.type);
                  const amt    = Math.abs(tx.amount||0);
                  return (
                    <div key={tx.id||i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--bg)', borderRadius:12, border:'1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13 }}>{tx.notes||tx.type}</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{ fontWeight:800, fontSize:15, color:credit?'#16a34a':'#ef4444' }}>
                        {credit?'+':'-'}{amt.toFixed(2)} ETB
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── ROOT EXPORT (same name Community.jsx already imports) ────────────────────
export default function ChallengesSection() {
  const { user }   = useAuth();
  const {
    challenges, myParticipations, wallet, transactions, loading,
    isParticipant, getMyParticipation,
    joinChallenge, leaveChallenge, createChallenge,
    depositFunds, withdrawFunds,
    getLeaderboard, getChallengeEvents,
  } = useChallenges();

  // All UI state is LOCAL — zero shared state with Community feed/groups/messages
  const [catFilter,   setCatFilter]   = useState('all');
  const [stakeFilter, setStakeFilter] = useState('all');
  const [selected,    setSelected]    = useState(null);
  const [showWallet,  setShowWallet]  = useState(false);
  const [showNura,    setShowNura]    = useState(false);
  const [showManual,  setShowManual]  = useState(false);
  const [joiningId,   setJoiningId]   = useState(null);

  const filtered = (challenges||[]).filter(ch => {
    if (catFilter!=='all' && ch.category!==catFilter) return false;
    if (stakeFilter==='free'   && ch.is_monetary)  return false;
    if (stakeFilter==='staked' && !ch.is_monetary) return false;
    return true;
  });

  const handleJoin = useCallback(async (ch) => {
    if (joiningId) return;

    if (ch.is_monetary && ch.entry_fee>0) {
      const bal = wallet?.withdrawable_balance||0;
      if (bal < ch.entry_fee) {
        showToast(`Need ${ch.entry_fee} ETB but you have ${bal.toFixed(2)} ETB. Deposit first.`,'error');
        setShowWallet(true);
        return;
      }
      const ok = window.confirm(
        `Join "${ch.title}"?\n\nEntry: ${ch.entry_fee} ETB\nPrize pool: ${(ch.prize_pool||0).toLocaleString()} ETB (88%)\nPlatform: 10%  ·  Creator: 2%\n\nStake is held in escrow. Proceed?`
      );
      if (!ok) return;
    }

    setJoiningId(ch.id);
    const res = await joinChallenge(ch.id);
    setJoiningId(null);

    if (res.success) {
      showToast(`✅ Joined "${ch.title}"!`,'success');
      window.dispatchEvent(new CustomEvent('nuracare:challenge_joined',{ detail:{ challengeId:ch.id }}));
    } else {
      showToast(res.error||'Could not join','error');
    }
  }, [joiningId, wallet, joinChallenge]);

  const handleLeave = useCallback(async (ch) => {
    const ok = window.confirm(`Leave "${ch.title}"?${ch.is_monetary?' Your stake will be reviewed per challenge rules.':''}`);
    if (!ok) return;
    const res = await leaveChallenge(ch.id);
    if (res.success) { showToast('Left challenge','success'); setSelected(null); }
    else showToast(res.error||'Could not leave','error');
  }, [leaveChallenge]);

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:60, color:'var(--text-muted)' }}>
        <Icons.Loader size={24} style={{ animation:'spin 1s linear infinite', marginRight:10 }}/> Loading challenges…
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── TOP BAR ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>Challenges &amp; Stakes</h2>
          <p style={{ margin:'4px 0 0', fontSize:13, color:'var(--text-muted)' }}>
            Real goals · Measurable verification · Competitive rewards
          </p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          {/* Wallet pill */}
          <button onClick={()=>setShowWallet(true)} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--white,#fff)', border:'1px solid var(--border)', padding:'8px 14px', borderRadius:12, cursor:'pointer', fontWeight:700, fontSize:13 }}>
            <Icons.Wallet size={16} color="var(--green)"/>
            <span>{(wallet?.withdrawable_balance||0).toFixed(0)} ETB</span>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>· {wallet?.nura_points||0} pts</span>
          </button>
          <button onClick={()=>setShowNura(true)} className="btn-primary" style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', fontSize:13, fontWeight:800 }}>
            <Icons.Sparkles size={15}/> Ask Nura
          </button>
          <button onClick={()=>setShowManual(true)} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--bg)', border:'1px solid var(--border)', padding:'8px 14px', borderRadius:12, cursor:'pointer', fontSize:13, fontWeight:700 }}>
            <Icons.Plus size={15}/> Manual
          </button>
        </div>
      </div>

      {/* ── AI BANNER ── */}
      <div
        onClick={()=>setShowNura(true)}
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(135deg,rgba(22,163,74,.10) 0%,rgba(34,197,94,.05) 100%)', border:'1px solid rgba(22,163,74,.25)', borderRadius:16, padding:'14px 18px', cursor:'pointer' }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:20, background:'rgba(22,163,74,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icons.Sparkles size={20} color="var(--green)"/>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:14 }}>Create with Nura AI</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>Describe any goal — Nura builds the verifiable challenge automatically</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--green)', color:'#fff', padding:'8px 14px', borderRadius:10, fontSize:13, fontWeight:800, flexShrink:0 }}>
          <Icons.Wand2 size={14}/> Try It <Icons.ArrowRight size={13}/>
        </div>
      </div>

      {/* ── CATEGORY CHIPS ── */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
        {CATEGORIES.map(c=>(
          <button key={c.id} onClick={()=>setCatFilter(c.id)} style={{
            display:'flex', alignItems:'center', gap:6, padding:'7px 13px', borderRadius:20,
            border: catFilter===c.id?'1.5px solid var(--green)':'1px solid var(--border)',
            background: catFilter===c.id?'rgba(22,163,74,.10)':'var(--white,#fff)',
            color: catFilter===c.id?'var(--green)':'var(--text-muted)',
            fontWeight: catFilter===c.id?800:500, fontSize:12, cursor:'pointer', whiteSpace:'nowrap',
          }}>
            <DynIcon name={c.icon} size={13}/> {c.label}
          </button>
        ))}
      </div>

      {/* ── FREE / STAKED TOGGLE ── */}
      <div style={{ display:'flex', background:'var(--white,#fff)', border:'1px solid var(--border)', borderRadius:12, padding:4, width:'fit-content', gap:4 }}>
        {[{v:'all',l:'All Formats'},{v:'free',l:'🆓 Free (XP)'},{v:'staked',l:'💰 Staked (ETB)'}].map(f=>(
          <button key={f.v} onClick={()=>setStakeFilter(f.v)} style={{ padding:'7px 14px', borderRadius:8, border:'none', background:stakeFilter===f.v?'var(--green)':'transparent', color:stakeFilter===f.v?'#fff':'var(--text-muted)', fontWeight:700, fontSize:12, cursor:'pointer' }}>
            {f.l}
          </button>
        ))}
      </div>

      {/* ── GRID ── */}
      {filtered.length===0
        ? (
          <div style={{ textAlign:'center', padding:'48px 24px', color:'var(--text-muted)' }}>
            <Icons.Trophy size={40} style={{ opacity:.2, marginBottom:12 }}/>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>No challenges match your filters</div>
            <div style={{ fontSize:13 }}>Create one with Nura AI or clear the filters</div>
          </div>
        )
        : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(270px,1fr))', gap:16 }}>
            {filtered.map(ch=>(
              <ChallengeCard
                key={ch.id}
                ch={ch}
                isJoined={isParticipant(ch.id)}
                participation={getMyParticipation(ch.id)}
                onOpen={setSelected}
                onJoin={handleJoin}
                onLeave={handleLeave}
                joiningId={joiningId}
              />
            ))}
          </div>
        )
      }

      {/* ── MY ACTIVE CHALLENGES ── */}
      {myParticipations.length>0 && (
        <div>
          <div style={{ fontSize:14, fontWeight:800, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
            <Icons.Flame size={16} color="#ea580c"/> My Active Challenges ({myParticipations.length})
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {myParticipations.map(part=>{
              const ch = (challenges||[]).find(c=>c.id===part.challenge_id);
              if (!ch) return null;
              const pct = Math.round(((part.completed_days?.length||0)/(ch.duration_days||7))*100);
              return (
                <div key={part.challenge_id} onClick={()=>setSelected(ch)} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'var(--white,#fff)', border:'1px solid var(--border)', borderRadius:14, cursor:'pointer' }}>
                  <img src={ch.image_url} alt={ch.title} style={{ width:48, height:48, borderRadius:10, objectFit:'cover', flexShrink:0 }} onError={e=>{e.target.src='https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80';}}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ch.title}</div>
                    <div style={{ marginTop:6, height:5, background:'var(--bg)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:'var(--green)', borderRadius:3, transition:'width .4s' }}/>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontWeight:800, fontSize:13 }}>{pct}%</div>
                    {(part.streak||0)>0 && <div style={{ fontSize:11, color:'#ea580c', fontWeight:700 }}><Icons.Flame size={11} style={{ verticalAlign:'middle' }}/> {part.streak}d</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {selected && (
        <DetailModal
          ch={selected}
          participation={getMyParticipation(selected.id)}
          isJoined={isParticipant(selected.id)}
          onClose={()=>setSelected(null)}
          onJoin={handleJoin}
          onLeave={handleLeave}
          getLeaderboard={getLeaderboard}
          getChallengeEvents={getChallengeEvents}
          joiningId={joiningId}
        />
      )}

      {showWallet && (
        <WalletModal
          wallet={wallet}
          transactions={transactions}
          onClose={()=>setShowWallet(false)}
          onDeposit={depositFunds}
          onWithdraw={withdrawFunds}
        />
      )}

      {showNura && (
        <NuraModal
          onClose={()=>setShowNura(false)}
          onCreate={createChallenge}
        />
      )}

      {showManual && (
        <ManualModal
          onClose={()=>setShowManual(false)}
          onCreate={createChallenge}
        />
      )}
    </div>
  );
}
