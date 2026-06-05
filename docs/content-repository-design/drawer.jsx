// ── Add to Repository drawer: Import → Configure UTM → Publish ──
const { useState: useStateD, useEffect: useEffectD, useMemo, useRef: useRefD } = React;

const STEPS = ["Import", "Track", "Publish"];

function guessTitleFromUrl(url) {
  try {
    const u = new URL(url);
    const seg = u.pathname.split("/").filter(Boolean).pop() || u.hostname;
    return seg.replace(/[-_]+/g, " ").replace(/\.\w+$/, "")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch (e) { return ""; }
}
function domainOf(url) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return ""; } }
function typeFromUrl(url) {
  if (/youtu\.?be|vimeo|\.mp4|wistia/i.test(url)) return "video";
  if (/\.pdf($|\?)/i.test(url)) return "pdf";
  if (/docs\.google|\.docx?($|\?)/i.test(url)) return "doc";
  return "link";
}

function AddDrawer({ open, onClose, onPublish }) {
  const [step, setStep] = useStateD(0);
  const [mode, setMode] = useStateD("link"); // link | upload
  const [url, setUrl] = useStateD("");
  const [file, setFile] = useStateD(null); // {name, kind, size}
  const [title, setTitle] = useStateD("");
  const [type, setType] = useStateD("link");
  const [utm, setUtm] = useStateD({ source: "", medium: "", campaign: "", content: "" });
  const [campaignMode, setCampaignMode] = useStateD("existing"); // existing | new
  const [newCampaign, setNewCampaign] = useStateD("");
  const [dest, setDest] = useStateD("blog");
  const [publishMode, setPublishMode] = useStateD("now"); // now | schedule | draft
  const [schedule, setSchedule] = useStateD("2026-06-15");
  const [copied, setCopied] = useStateD(false);

  // reset on open
  useEffectD(() => {
    if (open) {
      setStep(0); setMode("link"); setUrl(""); setFile(null); setTitle(""); setType("link");
      setUtm({ source: "", medium: "", campaign: "", content: "" });
      setCampaignMode("existing"); setNewCampaign(""); setDest("education");
      setPublishMode("now"); setCopied(false);
    }
  }, [open]);

  const effectiveCampaign = campaignMode === "new" ? newCampaign : utm.campaign;
  const baseUrl = mode === "link" ? url : `https://latimorelifelegacy.com/r/${(file?.name || "document").replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const finalUtm = { ...utm, campaign: effectiveCampaign };
  const taggedUrl = useMemo(() => buildUrl(baseUrl || "https://latimorelifelegacy.com/r/resource", finalUtm), [baseUrl, finalUtm.source, finalUtm.medium, finalUtm.campaign, finalUtm.content]);

  const canNext0 = mode === "link" ? (url.trim().length > 4 && title.trim()) : (file && title.trim());
  const canNext1 = utm.source && utm.medium && effectiveCampaign;

  function handleUrlBlur() {
    if (url && !title) setTitle(guessTitleFromUrl(url));
    if (url) setType(typeFromUrl(url));
  }
  function fakeUpload(kind, name, size) {
    setFile({ name, kind, size });
    setType(kind);
    if (!title) setTitle(name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
  }
  function autoGen() {
    const c = CAMPAIGNS.find((x) => x.id === utm.campaign);
    const topic = c ? c.topic : (title.split(" ")[0] || "general");
    setNewCampaign(autoCampaign(topic, finalUtm.source));
  }
  function copyUrl() {
    navigator.clipboard && navigator.clipboard.writeText(taggedUrl);
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  }
  function publish() {
    onPublish({
      title, type,
      source: mode === "link" ? url : file.name,
      domain: mode === "link" ? domainOf(url) : `Uploaded · ${file.size}`,
      campaign: effectiveCampaign,
      utm: finalUtm,
      destination: dest,
      status: publishMode === "now" ? "published" : publishMode === "schedule" ? "scheduled" : "draft",
      date: publishMode === "schedule" ? schedule : "2026-06-03",
      by: "Jackson L.",
    });
  }

  if (!open) return null;
  const destObj = DESTINATIONS.find((d) => d.id === dest);

  return (
    <div className="drawer-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="drawer-head">
          <div>
            <div className="drawer-eyebrow">Add to Repository</div>
            <h2 className="drawer-title">{STEPS[step] === "Import" ? "Bring in your content" : STEPS[step] === "Track" ? "Configure UTM tracking" : "Publish to your site"}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={20} /></button>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s} className={"step " + (i === step ? "step-on" : i < step ? "step-done" : "")}>
              <span className="step-dot">{i < step ? <Icon name="check" size={13} stroke={2.6} /> : i + 1}</span>
              <span className="step-label">{s}</span>
              {i < STEPS.length - 1 && <span className="step-line" />}
            </div>
          ))}
        </div>

        <div className="drawer-body">
          {step === 0 && (
            <div className="stack">
              <div className="seg">
                <button className={"seg-btn " + (mode === "link" ? "seg-on" : "")} onClick={() => setMode("link")}>
                  <Icon name="link" size={16} /> Paste a link
                </button>
                <button className={"seg-btn " + (mode === "upload" ? "seg-on" : "")} onClick={() => setMode("upload")}>
                  <Icon name="upload" size={16} /> Upload a document
                </button>
              </div>

              {mode === "link" ? (
                <div className="field">
                  <label>Resource URL</label>
                  <div className="input-wrap">
                    <Icon name="globe" size={17} className="input-ic" />
                    <input className="input has-ic" placeholder="https://…" value={url}
                      onChange={(e) => setUrl(e.target.value)} onBlur={handleUrlBlur} autoFocus />
                  </div>
                  {url && (
                    <div className="preview-card">
                      <TypeGlyph type={type} size={20} />
                      <div className="pc-body">
                        <div className="pc-domain">{domainOf(url) || "link"}</div>
                        <div className="pc-title">{title || guessTitleFromUrl(url) || "Untitled resource"}</div>
                      </div>
                      <span className="pc-badge">{TYPES[type].label} detected</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="field">
                  <label>Document</label>
                  {!file ? (
                    <div className="dropzone">
                      <span className="dz-ic"><Icon name="upload" size={26} /></span>
                      <div className="dz-title">Drag &amp; drop your file here</div>
                      <div className="dz-sub">PDF, Word, or Google Docs export · up to 25 MB</div>
                      <div className="dz-fakes">
                        <button className="fake-file" onClick={() => fakeUpload("pdf", "Medicare-AEP-2026-Guide.pdf", "2.1 MB")}>
                          <Icon name="pdf" size={15} /> Medicare-AEP-2026-Guide.pdf
                        </button>
                        <button className="fake-file" onClick={() => fakeUpload("doc", "Final-Expense-FAQ.docx", "96 KB")}>
                          <Icon name="doc" size={15} /> Final-Expense-FAQ.docx
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="preview-card">
                      <TypeGlyph type={file.kind} size={20} />
                      <div className="pc-body">
                        <div className="pc-domain">Uploaded · {file.size}</div>
                        <div className="pc-title">{file.name}</div>
                      </div>
                      <button className="icon-btn sm" onClick={() => { setFile(null); setTitle(""); }}><Icon name="x" size={16} /></button>
                    </div>
                  )}
                </div>
              )}

              <div className="field">
                <label>Display title <span className="lbl-hint">how it appears on your site</span></label>
                <input className="input" placeholder="e.g. Understanding Medicare Advantage" value={title}
                  onChange={(e) => setTitle(e.target.value)} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="stack">
              <div className="grid-2">
                <div className="field">
                  <label>utm_source</label>
                  <Select value={utm.source} onChange={(v) => setUtm({ ...utm, source: v })} options={UTM_SOURCES} placeholder="Where it's shared" />
                </div>
                <div className="field">
                  <label>utm_medium</label>
                  <Select value={utm.medium} onChange={(v) => setUtm({ ...utm, medium: v })} options={UTM_MEDIUMS} placeholder="Channel type" />
                </div>
              </div>

              <div className="field">
                <label className="lbl-row">
                  utm_campaign
                  <span className="campaign-toggle">
                    <button className={campaignMode === "existing" ? "on" : ""} onClick={() => setCampaignMode("existing")}>Existing</button>
                    <button className={campaignMode === "new" ? "on" : ""} onClick={() => setCampaignMode("new")}>New</button>
                  </span>
                </label>
                {campaignMode === "existing" ? (
                  <Select value={utm.campaign} onChange={(v) => setUtm({ ...utm, campaign: v })}
                    options={CAMPAIGNS.map((c) => ({ id: c.id, label: c.label }))} placeholder="Pick a campaign" />
                ) : (
                  <div className="input-wrap">
                    <input className="input mono-input" placeholder="latimore-…-2026" value={newCampaign}
                      onChange={(e) => setNewCampaign(e.target.value)} />
                    <button className="autogen" onClick={autoGen}><Icon name="sparkle" size={15} /> Auto-name</button>
                  </div>
                )}
                {campaignMode === "new" && <div className="lbl-hint mt6">We keep names consistent: <code>latimore-topic-source-year</code></div>}
              </div>

              <div className="field">
                <label>utm_content <span className="lbl-hint">optional · which creative or placement</span></label>
                <input className="input mono-input" placeholder="e.g. carousel-1, welcome-email" value={utm.content}
                  onChange={(e) => setUtm({ ...utm, content: e.target.value })} />
              </div>

              <div className="url-preview">
                <div className="up-head">
                  <span className="up-label"><span className="live-dot" /> Live tagged URL</span>
                  <button className="up-copy" onClick={copyUrl}>
                    <Icon name={copied ? "check" : "copy"} size={14} /> {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="up-url">{taggedUrl}</div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="stack">
              <div className="field">
                <label>Destination on your site</label>
                <Select value={dest} onChange={setDest} options={DESTINATIONS.map((d) => ({ id: d.id, label: d.label }))} />
                <div className="lbl-hint mt6">Publishes to <code>latimorelifelegacy.com{destObj?.path}</code></div>
              </div>

              <div className="deploy-card">
                <div className="dep-head">
                  <span className="dep-target">
                    <span className="dep-mark" />
                    <span>Vercel · Production</span>
                  </span>
                  <span className="dep-env">latimorelifelegacy.com</span>
                </div>
                <div className="dep-rows">
                  <div className="dep-row"><Icon name="branch" size={14} /> Deploys from <code>main</code></div>
                  <div className="dep-row"><Icon name="clock" size={14} /> Build &amp; go live in ~40s</div>
                </div>
                {publishMode === "draft" && <div className="dep-note">Drafts don't deploy — saved to the repository only.</div>}
                {publishMode === "schedule" && <div className="dep-note">Deploy triggers automatically on the scheduled date.</div>}
              </div>

              <div className="field">
                <label>When</label>
                <div className="radio-cards">
                  {[
                    { id: "now", t: "Publish now", s: "Goes live immediately", ic: "send" },
                    { id: "schedule", t: "Schedule", s: "Pick a date", ic: "calendar" },
                    { id: "draft", t: "Save as draft", s: "Stays unpublished", ic: "edit" },
                  ].map((o) => (
                    <button key={o.id} className={"radio-card " + (publishMode === o.id ? "rc-on" : "")} onClick={() => setPublishMode(o.id)}>
                      <Icon name={o.ic} size={17} />
                      <div>
                        <div className="rc-t">{o.t}</div>
                        <div className="rc-s">{o.s}</div>
                      </div>
                      <span className="rc-check"><Icon name="check" size={13} stroke={2.6} /></span>
                    </button>
                  ))}
                </div>
                {publishMode === "schedule" && (
                  <input type="date" className="input mt10" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
                )}
              </div>

              <div className="summary">
                <div className="sum-row"><span>Resource</span><strong>{title || "Untitled"}</strong></div>
                <div className="sum-row"><span>Type</span><strong>{TYPES[type].label}</strong></div>
                <div className="sum-row"><span>Campaign</span><strong className="mono-sm">{effectiveCampaign}</strong></div>
                <div className="sum-row"><span>Destination</span><strong>{destObj?.label}</strong></div>
                <div className="sum-row sum-url"><span>Tagged URL</span><strong className="mono-sm">{taggedUrl}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="drawer-foot">
          {step > 0 ? (
            <Button variant="ghost" icon="chevLeft" onClick={() => setStep(step - 1)}>Back</Button>
          ) : <span />}
          {step < 2 ? (
            <Button variant="primary" iconRight="chevRight" disabled={step === 0 ? !canNext0 : !canNext1}
              onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button variant="gold" icon="send" onClick={publish}>
              {publishMode === "now" ? "Publish & deploy" : publishMode === "schedule" ? "Schedule publish" : "Save draft"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AddDrawer });
