/* ═══════════════════════════════════════════════════════════
   జన సేవా కేంద్రం — Smart Wallet Engine v2
   
   కొత్త service page లో చేయవలసింది ఒక్కటే:
   <script src="wallet.js"></script>
   
   అంతే! ఇది automatically అన్ని print/download
   buttons ని detect చేసి wallet gate చేస్తుంది.
═══════════════════════════════════════════════════════════ */

(function() {

/* ── Firebase config ── */
const _CFG = {
  apiKey:            "AIzaSyA2NnpnP2WtqhgygLF-oN12R1xQhtwEmgs",
  authDomain:        "janseva-wallet.firebaseapp.com",
  projectId:         "janseva-wallet",
  storageBucket:     "janseva-wallet.firebasestorage.app",
  messagingSenderId: "786586023405",
  appId:             "1:786586023405:web:b303ce1215df8d2bdca3e4"
};

/* ── Credit prices per page (filename match) ── */
const PAGE_CREDITS = {
  'after_marriage_residence_affidavit.html': 10,
  'fmb-1.html':                               2,
  'resume.html':                             10,
  'Gap Certificate / Study Gap Affidavit':   10, 
};

/* ── Detect credits from current page filename ── */
function _getCredits() {
  const fname = location.pathname.split('/').pop().toLowerCase();
  for (const [key, val] of Object.entries(PAGE_CREDITS)) {
    if (fname === key) return val;
  }
  return 0; // default — free
}

/* ── Detect service name from page title — clean suffixes ── */
function _getServiceName() {
  let title = document.title.trim();

  // Remove common suffixes like "— MeeSeva", "– Live Preview", "| App" etc.
  title = title
    .replace(/\s*[—–|-]\s*(MeeSeva|జన సేవా|Jan Seva|Live Preview|Preview|App|Online|Portal|Form)\s*$/i, '')
    .replace(/\s*[—–|-]\s*$/, '')
    .trim();

  if (title && title.length > 2) return title;

  // Fallback: clean filename
  const fname = location.pathname.split('/').pop()
    .replace(/[-_]/g, ' ')
    .replace(/\.html$/i, '')
    .trim();
  return fname.charAt(0).toUpperCase() + fname.slice(1);
}

/* ── Read agent session ── */
function _getAgentId() {
  try {
    const s = JSON.parse(localStorage.getItem('agent_session') || '{}');
    return s.username || '';
  } catch { return ''; }
}

/* ── Button detection keywords ── */
const PRINT_KEYWORDS    = ['print','ప్రింట్','प्रिंट','🖨'];
const DOWNLOAD_KEYWORDS = ['download','word','pdf','డౌన్లోడ్','doc','save','📄','⬇'];

function _isMatchKeywords(text, keywords) {
  const t = text.toLowerCase();
  return keywords.some(k => t.includes(k.toLowerCase()));
}

function _isPrintBtn(btn) {
  return _isMatchKeywords(btn.textContent, PRINT_KEYWORDS) ||
         _isMatchKeywords(btn.getAttribute('onclick') || '', PRINT_KEYWORDS) ||
         _isMatchKeywords(btn.className, ['btn-print','print-btn']);
}

function _isDownloadBtn(btn) {
  return _isMatchKeywords(btn.textContent, DOWNLOAD_KEYWORDS) ||
         _isMatchKeywords(btn.getAttribute('onclick') || '', DOWNLOAD_KEYWORDS) ||
         _isMatchKeywords(btn.className, ['btn-word','btn-download','btn-pdf']);
}

/* ══════════════════════════════════════
   INTERCEPT window.print globally
   (only fires if NOT already handled by button hook)
══════════════════════════════════════ */
const _originalPrint = window.print.bind(window);
let _printHandledByBtn = false; // guard flag

window.print = function() {
  // If button hook already showed popup — skip intercept
  if (_printHandledByBtn) { _printHandledByBtn = false; _originalPrint(); return; }
  const agentId = _getAgentId();
  if (!agentId) { _originalPrint(); return; }
  walletGate({
    service:   '🖨️ ' + _getServiceName() + ' — Print',
    credits:   _getCredits(),
    emoji:     '🖨️',
    onConfirm: _originalPrint
  });
};

/* ══════════════════════════════════════
   UI INJECT
══════════════════════════════════════ */
function _injectUI() {
  if (document.getElementById('_w_overlay')) return;

  const css = document.createElement('style');
  css.textContent = `
    #_w_overlay {
      display:none; position:fixed; inset:0; z-index:2147483647;
      background:rgba(0,0,0,0.7); backdrop-filter:blur(6px);
      align-items:center; justify-content:center;
      font-family:'Inter','Segoe UI',sans-serif;
    }
    #_w_overlay.show { display:flex; }
    #_w_box {
      background:#111827; border:1px solid rgba(79,255,176,0.2);
      border-radius:24px; padding:36px 28px; max-width:380px;
      width:92%; text-align:center;
      box-shadow:0 24px 80px rgba(0,0,0,0.7);
      animation:_wSlide 0.25s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes _wSlide {
      from { transform:translateY(30px) scale(0.95); opacity:0; }
      to   { transform:translateY(0)    scale(1);    opacity:1; }
    }
    #_w_box ._we  { font-size:48px; margin-bottom:16px; }
    #_w_box ._wt  { font-size:19px; font-weight:700; color:#f0f4f8; margin-bottom:6px; line-height:1.3; }
    #_w_box ._ws  { font-size:13px; color:#6b7a8d; margin-bottom:22px; line-height:1.6; }
    #_w_box ._wcb {
      background:rgba(79,255,176,0.08); border:1.5px solid rgba(79,255,176,0.2);
      border-radius:16px; padding:18px; margin-bottom:14px;
    }
    #_w_box ._wcb._ins { background:rgba(248,113,113,0.08); border-color:rgba(248,113,113,0.25); }
    #_w_box ._wn  { font-size:38px; font-weight:800; color:#4fffb0; line-height:1; }
    #_w_box ._wcb._ins ._wn { color:#f87171; }
    #_w_box ._wl  { font-size:12px; color:#6b7a8d; margin-top:6px; }
    #_w_box ._wa  { font-size:12px; color:#6b7a8d; margin-bottom:22px; }
    #_w_box ._wbs { display:flex; gap:10px; }
    #_w_box ._wbc {
      flex:1; padding:14px; border-radius:14px; font-size:14px;
      font-weight:600; background:#1f2937; color:#6b7a8d;
      border:1px solid rgba(255,255,255,0.06); cursor:pointer;
      transition:background 0.2s;
    }
    #_w_box ._wbc:hover { background:#263045; }
    #_w_box ._wbk {
      flex:1; padding:14px; border-radius:14px; font-size:14px;
      font-weight:700; background:#4fffb0; color:#0a0f1a;
      border:none; cursor:pointer; transition:all 0.2s;
    }
    #_w_box ._wbk:hover:not(:disabled) { background:#6fffc0; }
    #_w_box ._wbk:disabled { opacity:0.45; cursor:not-allowed; }
    #_w_box ._werr {
      font-size:12px; color:#f87171; margin-top:14px;
      display:none; padding:10px; background:rgba(248,113,113,0.08);
      border-radius:10px;
    }
    #_w_bal_chip {
      position:fixed; bottom:80px; right:16px; z-index:99998;
      background:#111827; border:1px solid rgba(79,255,176,0.25);
      border-radius:20px; padding:8px 14px;
      font-family:'Inter',sans-serif; font-size:13px; font-weight:600;
      color:#4fffb0; display:none; align-items:center; gap:6px;
      box-shadow:0 4px 20px rgba(0,0,0,0.4); cursor:default;
    }
    #_w_bal_chip.show { display:flex; }
    #_w_bal_chip.low  { color:#fbbf24; border-color:rgba(251,191,36,0.3); }
    #_w_bal_chip.empty{ color:#f87171; border-color:rgba(248,113,113,0.3); }
  `;
  document.head.appendChild(css);

  // Confirm overlay
  const ov = document.createElement('div');
  ov.id = '_w_overlay';
  ov.innerHTML = `
    <div id="_w_box">
      <div class="_we" id="_we">🖨️</div>
      <div class="_wt" id="_wt">Confirm చేయండి</div>
      <div class="_ws" id="_ws">ఈ action కోసం wallet నుండి credits తీసివేయబడతాయి</div>
      <div class="_wcb" id="_wcb">
        <div class="_wn" id="_wn">0</div>
        <div class="_wl">credits = ₹<span id="_wr">0</span></div>
      </div>
      <div class="_wa" id="_wa"></div>
      <div class="_wbs">
        <button class="_wbc" onclick="_wCancel()">రద్దు చేయి</button>
        <button class="_wbk" id="_wbk" onclick="_wConfirm()">✓ Confirm</button>
      </div>
      <div class="_werr" id="_werr"></div>
    </div>`;
  document.body.appendChild(ov);

  // Balance chip (bottom right corner)
  const chip = document.createElement('div');
  chip.id = '_w_bal_chip';
  chip.innerHTML = `<span>💰</span><span id="_w_bal_txt">—</span>`;
  document.body.appendChild(chip);
}

/* ══════════════════════════════════════
   FIREBASE INIT (once)
══════════════════════════════════════ */
let _db = null;
function _initDb() {
  if (_db) return _db;
  if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(_CFG);
  else firebase.app(); // use existing
  _db = firebase.firestore();
  return _db;
}

/* ══════════════════════════════════════
   BALANCE CHIP — show on page load
══════════════════════════════════════ */
async function _loadBalanceChip() {
  const agentId = _getAgentId();
  if (!agentId) return;
  try {
    const db   = _initDb();
    const snap = await db.collection('wallets').doc(agentId).get();
    const bal  = snap.exists ? (snap.data().balance || 0) : 0;
    _updateChip(bal);
    // Live listener
    db.collection('wallets').doc(agentId).onSnapshot(d => {
      if (d.exists) _updateChip(d.data().balance || 0);
    });
  } catch(e) { /* silent — chip stays hidden */ }
}

function _updateChip(bal) {
  const chip = document.getElementById('_w_bal_chip');
  const txt  = document.getElementById('_w_bal_txt');
  if (!chip || !txt) return;
  txt.textContent = bal + ' ₹';
  chip.classList.remove('low','empty');
  chip.classList.add('show');
  if (bal === 0)      chip.classList.add('empty');
  else if (bal <= 20) chip.classList.add('low');
}

/* ══════════════════════════════════════
   WALLET GATE — public API
══════════════════════════════════════ */
let _pending = null;
let _cachedBal = null;

window.walletGate = async function({ service, credits, emoji = '🖨️', onConfirm }) {
  const agentId = _getAgentId();
  if (!agentId) { onConfirm(); return; } // not logged in → free

  let balance = 0;
  try {
    const db   = _initDb();
    const snap = await db.collection('wallets').doc(agentId).get();
    balance = snap.exists ? (snap.data().balance || 0) : 0;
    _cachedBal = balance;
  } catch(e) {
    onConfirm(); return; // DB error → allow free
  }

  _pending = { agentId, service, credits, onConfirm };

  const enough = balance >= credits;
  document.getElementById('_we').textContent = emoji;
  document.getElementById('_wt').textContent = service;
  document.getElementById('_ws').textContent = enough
    ? 'మీ wallet నుండి credits తీసివేయబడతాయి'
    : '⚠️ తగినన్ని credits లేవు — Admin recharge చేయించుకోండి';
  document.getElementById('_wn').textContent = credits;
  document.getElementById('_wr').textContent = credits;
  document.getElementById('_wa').textContent =
    `Balance: ${balance} ₹ → తర్వాత: ${Math.max(0, balance - credits)} ₹`;
  document.getElementById('_wcb').classList.toggle('_ins', !enough);
  const btn = document.getElementById('_wbk');
  btn.textContent = enough ? '✓ Confirm చేయి' : '⚠ Balance తక్కువ';
  btn.disabled    = !enough;
  document.getElementById('_werr').style.display = 'none';
  document.getElementById('_w_overlay').classList.add('show');
};

window._wCancel = function() {
  document.getElementById('_w_overlay').classList.remove('show');
  _pending = null;
};

window._wConfirm = async function() {
  if (!_pending) return;
  const { agentId, service, credits, onConfirm } = _pending;
  const btn   = document.getElementById('_wbk');
  const errEl = document.getElementById('_werr');
  btn.disabled    = true;
  btn.textContent = '⏳ Processing...';
  errEl.style.display = 'none';

  try {
    const db  = _initDb();
    const ref = db.collection('wallets').doc(agentId);
    await db.runTransaction(async tx => {
      const doc = await tx.get(ref);
      const bal = doc.exists ? (doc.data().balance || 0) : 0;
      if (bal < credits) throw new Error('Insufficient balance');
      tx.update(ref, { balance: firebase.firestore.FieldValue.increment(-credits) });
    });
    await db.collection('transactions').add({
      agentId,
      service,
      credits:   -credits,
      type:      'debit',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    document.getElementById('_w_overlay').classList.remove('show');
    _pending = null;
    onConfirm();
  } catch(e) {
    btn.disabled    = false;
    btn.textContent = '✓ Confirm చేయి';
    errEl.textContent   = e.message === 'Insufficient balance'
      ? '⚠️ Balance తక్కువ — Admin దగ్గర recharge చేయించుకోండి'
      : '❌ Error: ' + e.message;
    errEl.style.display = 'block';
  }
};

/* ══════════════════════════════════════
   AUTO-HOOK buttons after DOM ready
══════════════════════════════════════ */
function _hookButtons() {
  const agentId = _getAgentId();
  if (!agentId) return; // not agent — no hooking

  const credits     = _getCredits();
  const serviceName = _getServiceName();

  document.querySelectorAll('button, a[onclick], input[type="button"]').forEach(btn => {
    if (btn.dataset._wHooked) return; // already hooked
    btn.dataset._wHooked = '1';

    const isPrint    = _isPrintBtn(btn);
    const isDownload = _isDownloadBtn(btn);
    if (!isPrint && !isDownload) return;

    const origOnclick = btn.onclick;
    const origAttr    = btn.getAttribute('onclick');

    // Remove original handler
    btn.removeAttribute('onclick');
    btn.onclick = null;

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      const emoji  = isPrint ? '🖨️' : '📄';
      const action = isPrint ? 'Print' : 'Download';

      walletGate({
        service:   `${emoji} ${serviceName} — ${action}`,
        credits,
        emoji,
        onConfirm: () => {
          if (isPrint) {
            // Set flag so window.print intercept knows button already handled this
            _printHandledByBtn = true;
            _originalPrint();
          } else if (origOnclick) {
            origOnclick.call(btn);
          } else if (origAttr) {
            // eslint-disable-next-line no-new-func
            new Function(origAttr).call(btn);
          }
        }
      });
    }, true);
  });
}

/* ── MutationObserver: hook dynamically added buttons too ── */
function _observe() {
  const obs = new MutationObserver(() => _hookButtons());
  obs.observe(document.body, { childList: true, subtree: true });
}

/* ══════════════════════════════════════
   BOOT
══════════════════════════════════════ */
function _boot() {
  _injectUI();
  _hookButtons();
  _observe();
  _loadBalanceChip();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _boot);
} else {
  _boot();
}

})(); // end IIFE
