// ── Latimore Content Repository — dashboard app ──
const { useState: useS, useMemo: useM } = React;

function BulkUtmModal({ open, count, onClose, onApply }) {
  const [campaign, setCampaign] = useS("");
  const [source, setSource] = useS("");
  const [medium, setMedium] = useS("");
  React.useEffect(() => { if (open) { setCampaign(""); setSource(""); setMedium(""); } }, [open]);
  if (!open) return null;
  return (
    <div className="drawer-scrim center" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="drawer-head">
          <div>
            <div className="drawer-eyebrow">Bulk action</div>
            <h2 className="drawer-title">Apply UTM to {count} item{count > 1 ? "s" : ""}</h2>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={20} /></button>
        </div>
        <div className="drawer-body">
          <p className="modal-note">Set any fields below — only the ones you choose are overwritten across the selected resources. Empty fields are left as-is.</p>
          <div className="field">
            <label>utm_campaign</label>
            <Select value={campaign} onChange={setCampaign} options={CAMPAIGNS.map((c) => ({ id: c.id, label: c.label }))} placeholder="Leave unchanged" />
          </div>
          <div className="grid-2">
            <div className="field">
              <label>utm_source</label>
              <Select value={source} onChange={setSource} options={UTM_SOURCES} placeholder="Leave unchanged" />
            </div>
            <div className="field">
              <label>utm_medium</label>
              <Select value={medium} onChange={setMedium} options={UTM_MEDIUMS} placeholder="Leave unchanged" />
            </div>
          </div>
        </div>
        <div className="drawer-foot">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="gold" icon="layers" disabled={!campaign && !source && !medium}
            onClick={() => onApply({ campaign, source, medium })}>Apply to {count}</Button>
        </div>
      </div>
    </div>
  );
}

function Row({ r, selected, onToggle, onOpen }) {
  const camp = CAMPAIGNS.find((c) => c.id === r.campaign);
  const dest = DESTINATIONS.find((d) => d.id === r.destination);
  const tagged = buildUrl(/^https?:/.test(r.source) ? r.source : `https://latimorelifelegacy.com${dest?.path || ""}`, r.utm);
  return (
    <div className={"row " + (selected ? "row-sel" : "")}>
      <label className="cbox">
        <input type="checkbox" checked={selected} onChange={onToggle} />
        <span className="cbox-box"><Icon name="check" size={12} stroke={3} /></span>
      </label>
      <div className="row-main" onClick={onOpen}>
        <TypeGlyph type={r.type} />
        <div className="row-text">
          <div className="row-title">{r.title}</div>
          <div className="row-meta">
            <span className="rm-domain">{r.domain}</span>
            <span className="dotsep" />
            <span className="rm-url mono-sm">{tagged.replace(/^https?:\/\//, "")}</span>
          </div>
        </div>
      </div>
      <div className="row-camp">
        {camp && <span className="camp-chip">{camp.label}</span>}
      </div>
      <div className="row-dest">{dest?.label}</div>
      <div className="row-status"><StatusBadge status={r.status} /></div>
      <div className="row-date">{new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
      <button className="icon-btn sm row-more"><Icon name="dots" size={18} /></button>
    </div>
  );
}

function App() {
  const [items, setItems] = useS(SEED);
  const [drawer, setDrawer] = useS(false);
  const [bulk, setBulk] = useS(false);
  const [sel, setSel] = useS({});
  const [toast, setToast] = useS(null);
  const [q, setQ] = useS("");
  const [fType, setFType] = useS("all");
  const [fStatus, setFStatus] = useS("all");
  const [fCampaign, setFCampaign] = useS("all");

  function ping(msg) { const t = { id: Date.now(), msg }; setToast(t); setTimeout(() => setToast((c) => c && c.id === t.id ? null : c), 2600); }

  const filtered = useM(() => items.filter((r) => {
    if (fType !== "all" && r.type !== fType) return false;
    if (fStatus !== "all" && r.status !== fStatus) return false;
    if (fCampaign !== "all" && r.campaign !== fCampaign) return false;
    if (q && !(r.title + r.domain).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [items, fType, fStatus, fCampaign, q]);

  const selIds = Object.keys(sel).filter((k) => sel[k]);
  const selCount = selIds.length;
  const allSel = filtered.length > 0 && filtered.every((r) => sel[r.id]);

  function toggleAll() {
    if (allSel) { const n = { ...sel }; filtered.forEach((r) => delete n[r.id]); setSel(n); }
    else { const n = { ...sel }; filtered.forEach((r) => (n[r.id] = true)); setSel(n); }
  }

  function publish(rec) {
    setItems([{ ...rec, id: "r" + Date.now() }, ...items]);
    setDrawer(false);
    ping(rec.status === "published" ? "Deploying to latimorelifelegacy.com — live in ~40s" : rec.status === "scheduled" ? "Scheduled — deploys on publish date" : "Saved to repository as draft");
  }

  function applyBulk(patch) {
    setItems(items.map((r) => sel[r.id] ? { ...r, utm: { ...r.utm, ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v)) }, campaign: patch.campaign || r.campaign } : r));
    setBulk(false); setSel({});
    ping(`UTM applied to ${selCount} resource${selCount > 1 ? "s" : ""}`);
  }

  const stats = useM(() => ({
    total: items.length,
    published: items.filter((r) => r.status === "published").length,
    scheduled: items.filter((r) => r.status === "scheduled").length,
    campaigns: new Set(items.map((r) => r.campaign)).size,
  }), [items]);

  const typeFilters = [
    { id: "all", label: "All types" },
    { id: "link", label: "Links" }, { id: "pdf", label: "PDFs" },
    { id: "doc", label: "Docs" }, { id: "video", label: "Videos" },
  ];

  return (
    <div className="app">
      {/* Top bar */}
      <header className="topbar">
        <div className="tb-left">
          <Wordmark />
          <span className="tb-divider" />
          <span className="tb-app">Content Repository</span>
        </div>
        <div className="tb-right">
          <div className="search">
            <Icon name="search" size={17} className="search-ic" />
            <input placeholder="Search resources…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button variant="primary" icon="plus" onClick={() => setDrawer(true)}>Add to Repository</Button>
        </div>
      </header>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="side-group">
            <div className="side-h">Status</div>
            {[
              { id: "all", label: "Everything", n: items.length },
              { id: "published", label: "Published", n: stats.published },
              { id: "scheduled", label: "Scheduled", n: stats.scheduled },
              { id: "draft", label: "Drafts", n: items.filter((r) => r.status === "draft").length },
            ].map((s) => (
              <button key={s.id} className={"side-item " + (fStatus === s.id ? "side-on" : "")} onClick={() => setFStatus(s.id)}>
                <span>{s.label}</span><span className="side-n">{s.n}</span>
              </button>
            ))}
          </div>
          <div className="side-group">
            <div className="side-h">Campaigns</div>
            <button className={"side-item " + (fCampaign === "all" ? "side-on" : "")} onClick={() => setFCampaign("all")}>
              <span>All campaigns</span><span className="side-n">{stats.campaigns}</span>
            </button>
            {CAMPAIGNS.map((c) => (
              <button key={c.id} className={"side-item " + (fCampaign === c.id ? "side-on" : "")} onClick={() => setFCampaign(c.id)}>
                <span className="side-camp"><span className="camp-tick" />{c.label}</span>
                <span className="side-n">{items.filter((r) => r.campaign === c.id).length}</span>
              </button>
            ))}
          </div>
          <div className="side-foot">
            <div className="beat">#TheBeatGoesOn</div>
            <div className="beat-sub">Protecting Today. Securing Tomorrow.</div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="page-head">
            <div>
              <h1 className="page-title">Repository</h1>
              <p className="page-sub">Every link &amp; document, UTM-tagged and ready for your site.</p>
            </div>
          </div>

          <div className="stats">
            {[
              { k: "Resources", v: stats.total, ic: "layers" },
              { k: "Published", v: stats.published, ic: "globe" },
              { k: "Scheduled", v: stats.scheduled, ic: "clock" },
              { k: "Campaigns", v: stats.campaigns, ic: "sparkle" },
            ].map((s) => (
              <div className="stat" key={s.k}>
                <span className="stat-ic"><Icon name={s.ic} size={18} /></span>
                <div><div className="stat-v">{s.v}</div><div className="stat-k">{s.k}</div></div>
              </div>
            ))}
          </div>

          <div className="type-bar">
            {typeFilters.map((t) => (
              <Pill key={t.id} active={fType === t.id} onClick={() => setFType(t.id)}>{t.label}</Pill>
            ))}
          </div>

          {/* Table */}
          <div className="table">
            <div className="thead">
              <label className="cbox">
                <input type="checkbox" checked={allSel} onChange={toggleAll} />
                <span className="cbox-box"><Icon name="check" size={12} stroke={3} /></span>
              </label>
              <div className="th-main">Resource</div>
              <div className="th-camp">Campaign</div>
              <div className="th-dest">Destination</div>
              <div className="th-status">Status</div>
              <div className="th-date">Date</div>
              <div className="th-more" />
            </div>
            {filtered.length === 0 ? (
              <div className="empty">
                <span className="empty-ic"><Icon name="inbox" size={30} /></span>
                <div className="empty-t">Nothing here yet</div>
                <div className="empty-s">Add a link or document to start tagging.</div>
                <Button variant="primary" icon="plus" onClick={() => setDrawer(true)}>Add to Repository</Button>
              </div>
            ) : filtered.map((r) => (
              <Row key={r.id} r={r} selected={!!sel[r.id]}
                onToggle={() => setSel({ ...sel, [r.id]: !sel[r.id] })}
                onOpen={() => ping("Opening resource — UTM links are tracked")} />
            ))}
          </div>
        </main>
      </div>

      {/* Bulk action bar */}
      {selCount > 0 && (
        <div className="bulk-bar">
          <div className="bulk-left">
            <span className="bulk-count">{selCount}</span> selected
            <button className="bulk-clear" onClick={() => setSel({})}>Clear</button>
          </div>
          <div className="bulk-actions">
            <Button variant="ghost" size="sm" icon="layers" onClick={() => setBulk(true)}>Apply UTM</Button>
            <Button variant="gold" size="sm" icon="send" onClick={() => { setItems(items.map((r) => sel[r.id] ? { ...r, status: "published" } : r)); ping(`${selCount} resources published`); setSel({}); }}>Publish</Button>
          </div>
        </div>
      )}

      <AddDrawer open={drawer} onClose={() => setDrawer(false)} onPublish={publish} />
      <BulkUtmModal open={bulk} count={selCount} onClose={() => setBulk(false)} onApply={applyBulk} />
      <Toast toast={toast} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
