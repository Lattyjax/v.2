'use client'

import React, { useState, useEffect } from 'react'

const GOLD = '#C9A25F'
const NAVY = '#0B0F17'
const SURFACE = '#131929'
const SURFACE2 = '#1a2535'
const INK = '#F7F7F5'
const MUTED = '#A9B1BE'
const PHONE = '(717) 615-2613'
const FILLOUT_URL = 'https://globalfinancialimpact.fillout.com/t/tMz7ZcqpaZus'

export default function QuoteCalculator() {
  const [activeTab, setActiveTab] = useState<'life' | 'annuity'>('life')

  const [lifeQuote, setLifeQuote] = useState({
    age: 35, gender: 'male', smoker: 'no', coverage: 500000, term: 20, health: 'preferred',
  })
  const [annuityQuote, setAnnuityQuote] = useState({
    age: 60, premium: 100000, product: 'safe-income', deferral: 10,
  })
  const [lifeResults, setLifeResults] = useState<{
    monthlyPremium: number; annualPremium: number; totalPremium: number; ethosMonthly: number; savings: number
  } | null>(null)
  const [annuityResults, setAnnuityResults] = useState<{
    incomeBase: number; monthlyIncome: number; annualIncome: number; cashValue: number; lifetimeIncome: number; totalReturn: number
  } | null>(null)

  const calculateLife = () => {
    const { age, gender, smoker, coverage, term, health } = lifeQuote
    let r = 0.5
    if (age < 30) r *= 0.8
    else if (age < 40) r *= 1.0
    else if (age < 50) r *= 1.5
    else if (age < 60) r *= 2.5
    else r *= 4.0
    if (gender === 'female') r *= 0.85
    if (smoker === 'yes') r *= 2.0
    if (health === 'preferred') r *= 0.9
    else if (health === 'standard') r *= 1.2
    else if (health === 'substandard') r *= 1.5
    if (term === 10) r *= 0.8
    else if (term === 15) r *= 0.9
    else if (term === 30) r *= 1.15
    const monthly = (coverage / 1000) * r
    const annual = monthly * 12
    const ethosMonthly = Math.max(39, monthly * 0.75)
    setLifeResults({
      monthlyPremium: Math.round(monthly),
      annualPremium: Math.round(annual),
      totalPremium: Math.round(annual * term),
      ethosMonthly: Math.round(ethosMonthly),
      savings: Math.round((monthly - ethosMonthly) * 12 * term),
    })
  }

  const calculateAnnuity = () => {
    const { age, premium, product, deferral } = annuityQuote
    let rollUp = 0.072, withdrawal = 0.05
    if (product === 'fixed') { rollUp = 0.055; withdrawal = 0 }
    else if (product === 'indexed') { rollUp = 0.065; withdrawal = 0.045 }
    const incomeBase = premium * Math.pow(1 + rollUp, deferral)
    const annual = incomeBase * withdrawal
    setAnnuityResults({
      incomeBase: Math.round(incomeBase),
      monthlyIncome: Math.round(annual / 12),
      annualIncome: Math.round(annual),
      cashValue: Math.round(premium * Math.pow(1.04, deferral)),
      lifetimeIncome: Math.round(annual * 25),
      totalReturn: Math.round((annual * 25 / premium - 1) * 100),
    })
  }

  useEffect(() => { if (activeTab === 'life') { calculateLife() } else { calculateAnnuity() } }, [lifeQuote, annuityQuote, activeTab])

  const card = { background: SURFACE2, borderRadius: 16, padding: '2rem', border: `1px solid #2a3548` }
  const btn = (active: boolean, accent = GOLD) => ({
    padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700, cursor: 'pointer', border: 'none',
    background: active ? accent : '#1e2d42', color: active ? NAVY : MUTED, transition: 'all 0.2s',
  })
  const input = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 10, border: `1px solid #2a3548`,
    background: '#0e1827', color: INK, fontSize: '1rem', boxSizing: 'border-box' as const,
  }
  const label = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: MUTED, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }

  return (
    <div style={{ background: NAVY, minHeight: '100vh', padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ ...card, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, background: GOLD, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🛡️</div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: INK }}>Insurance Quote Calculator</h1>
                <p style={{ margin: 0, color: MUTED, fontSize: '0.9rem' }}>Latimore Life & Legacy LLC</p>
              </div>
            </div>
            <p style={{ margin: 0, color: GOLD, fontStyle: 'italic', fontSize: '0.9rem' }}>Protecting Today. Securing Tomorrow. #TheBeatGoesOn</p>
          </div>
          <div style={{ textAlign: 'right', color: MUTED, fontSize: '0.85rem', lineHeight: 1.7 }}>
            <div style={{ color: GOLD, fontWeight: 700, fontSize: '1.05rem' }}>{PHONE}</div>
            <div>NIPR #21638507</div>
            <div>Licensed in All 50 States</div>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button onClick={() => setActiveTab('life')} style={{ ...btn(activeTab === 'life'), flex: 1, padding: '1rem' }}>
            🛡️ Life Insurance
          </button>
          <button onClick={() => setActiveTab('annuity')} style={{ ...btn(activeTab === 'annuity'), flex: 1, padding: '1rem' }}>
            📈 Annuities
          </button>
        </div>

        {/* Life Insurance */}
        {activeTab === 'life' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {/* Inputs */}
            <div style={card}>
              <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem', fontWeight: 800, color: GOLD }}>Your Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={label}>Age</label>
                  <input type="range" min={18} max={75} value={lifeQuote.age} onChange={e => setLifeQuote(p => ({ ...p, age: +e.target.value }))} style={{ width: '100%', accentColor: GOLD }} />
                  <div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, color: GOLD, marginTop: 4 }}>{lifeQuote.age} years old</div>
                </div>
                <div>
                  <label style={label}>Gender</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {['male', 'female'].map(g => <button key={g} onClick={() => setLifeQuote(p => ({ ...p, gender: g }))} style={btn(lifeQuote.gender === g)}>{g === 'male' ? 'Male' : 'Female'}</button>)}
                  </div>
                </div>
                <div>
                  <label style={label}>Tobacco Use</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[['no', 'Non-Smoker'], ['yes', 'Smoker']].map(([v, lbl]) => <button key={v} onClick={() => setLifeQuote(p => ({ ...p, smoker: v }))} style={btn(lifeQuote.smoker === v)}>{lbl}</button>)}
                  </div>
                </div>
                <div>
                  <label style={label}>Coverage Amount</label>
                  <select value={lifeQuote.coverage} onChange={e => setLifeQuote(p => ({ ...p, coverage: +e.target.value }))} style={input}>
                    {[100000, 250000, 500000, 700000, 1000000, 2000000].map(v => <option key={v} value={v}>${v.toLocaleString()}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Term Length</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {[10, 15, 20, 30].map(t => <button key={t} onClick={() => setLifeQuote(p => ({ ...p, term: t }))} style={btn(lifeQuote.term === t)}>{t} yr</button>)}
                  </div>
                </div>
                <div>
                  <label style={label}>Health Class</label>
                  <select value={lifeQuote.health} onChange={e => setLifeQuote(p => ({ ...p, health: e.target.value }))} style={input}>
                    <option value="preferred">Preferred (Excellent Health)</option>
                    <option value="standard-plus">Standard Plus (Good Health)</option>
                    <option value="standard">Standard (Average Health)</option>
                    <option value="substandard">Substandard (Health Issues)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ background: `linear-gradient(135deg, #1a2535, #0e1827)`, border: `2px solid ${GOLD}33`, borderRadius: 16, padding: '2rem' }}>
                <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem', fontWeight: 800, color: GOLD }}>Your Estimated Quote</h2>
                {lifeResults && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: '#0B0F17', borderRadius: 12, padding: '1.5rem', textAlign: 'center', border: `1px solid ${GOLD}44` }}>
                      <div style={{ color: MUTED, fontSize: '0.85rem', marginBottom: 4 }}>Monthly Premium</div>
                      <div style={{ fontSize: '3rem', fontWeight: 900, color: GOLD }}>${lifeResults.monthlyPremium}</div>
                      <div style={{ color: MUTED, fontSize: '0.85rem' }}>per month</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[['Annual', `$${lifeResults.annualPremium.toLocaleString()}`], [`${lifeQuote.term}-Year Total`, `$${lifeResults.totalPremium.toLocaleString()}`]].map(([k, v]) => (
                        <div key={k} style={{ background: '#0B0F17', borderRadius: 10, padding: '1rem', border: `1px solid #2a3548` }}>
                          <div style={{ color: MUTED, fontSize: '0.75rem', marginBottom: 4 }}>{k}</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: INK }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: `${GOLD}15`, border: `2px solid ${GOLD}66`, borderRadius: 12, padding: '1.25rem' }}>
                      <div style={{ fontWeight: 700, color: GOLD, marginBottom: 6 }}>💰 Ethos Special Offer</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: INK }}>${lifeResults.ethosMonthly}/mo</div>
                      <div style={{ color: MUTED, fontSize: '0.85rem', marginTop: 4 }}>Save ${lifeResults.savings.toLocaleString()} over {lifeQuote.term} years</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={card}>
                <h3 style={{ margin: '0 0 1rem', color: INK, fontWeight: 700 }}>Coverage Breakdown</h3>
                {[['Death Benefit', `$${lifeQuote.coverage.toLocaleString()}`], ['Term', `${lifeQuote.term} years`], ['Age at Expiry', `${lifeQuote.age + lifeQuote.term}`], ['Type', 'Level Term']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #2a3548' }}>
                    <span style={{ color: MUTED }}>{k}</span><span style={{ fontWeight: 700, color: INK }}>{v}</span>
                  </div>
                ))}
                <button onClick={() => window.open(FILLOUT_URL, '_blank')} style={{ width: '100%', marginTop: 20, padding: '1rem', borderRadius: 10, background: GOLD, color: NAVY, fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer' }}>
                  ✉️ Get Official Quote
                </button>
                <p style={{ color: MUTED, fontSize: '0.75rem', textAlign: 'center', marginTop: 8 }}>Estimate only. Final rates subject to underwriting.</p>
              </div>
            </div>
          </div>
        )}

        {/* Annuity */}
        {activeTab === 'annuity' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            <div style={card}>
              <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem', fontWeight: 800, color: GOLD }}>Annuity Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={label}>Your Age</label>
                  <input type="range" min={40} max={80} value={annuityQuote.age} onChange={e => setAnnuityQuote(p => ({ ...p, age: +e.target.value }))} style={{ width: '100%', accentColor: GOLD }} />
                  <div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, color: GOLD, marginTop: 4 }}>{annuityQuote.age} years old</div>
                </div>
                <div>
                  <label style={label}>Initial Premium</label>
                  <input type="number" value={annuityQuote.premium} onChange={e => setAnnuityQuote(p => ({ ...p, premium: +e.target.value || 0 }))} style={{ ...input, fontSize: '1.4rem', fontWeight: 700 }} step={10000} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {[50000, 100000, 250000, 500000].map(v => (
                      <button key={v} onClick={() => setAnnuityQuote(p => ({ ...p, premium: v }))} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, background: '#1e2d42', border: 'none', color: MUTED, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>${v / 1000}K</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={label}>Product Type</label>
                  <select value={annuityQuote.product} onChange={e => setAnnuityQuote(p => ({ ...p, product: e.target.value }))} style={input}>
                    <option value="safe-income">F&G Safe Income Advantage (7.20% rollup)</option>
                    <option value="indexed">Fixed Indexed Annuity (6.50% rollup)</option>
                    <option value="fixed">Multi-Year Guaranteed (5.50%)</option>
                  </select>
                </div>
                <div>
                  <label style={label}>Deferral Period</label>
                  <input type="range" min={0} max={20} value={annuityQuote.deferral} onChange={e => setAnnuityQuote(p => ({ ...p, deferral: +e.target.value }))} style={{ width: '100%', accentColor: GOLD }} />
                  <div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, color: GOLD, marginTop: 4 }}>{annuityQuote.deferral} years</div>
                  <div style={{ textAlign: 'center', color: MUTED, fontSize: '0.85rem' }}>Income starts at age {annuityQuote.age + annuityQuote.deferral}</div>
                </div>
                <div style={{ background: `${GOLD}10`, borderRadius: 12, padding: '1rem', border: `1px solid ${GOLD}33` }}>
                  <div style={{ fontWeight: 700, color: GOLD, marginBottom: 8 }}>Why Choose an Annuity?</div>
                  {['Guaranteed lifetime income', 'Principal protection', 'Tax-deferred growth', 'No market risk'].map(b => (
                    <div key={b} style={{ color: MUTED, fontSize: '0.9rem', padding: '3px 0' }}>✓ {b}</div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ background: `linear-gradient(135deg, #1a2535, #0e1827)`, border: `2px solid ${GOLD}33`, borderRadius: 16, padding: '2rem' }}>
                <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.3rem', fontWeight: 800, color: GOLD }}>Your Income Projection</h2>
                {annuityResults && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: '#0B0F17', borderRadius: 12, padding: '1.5rem', textAlign: 'center', border: `1px solid ${GOLD}44` }}>
                      <div style={{ color: MUTED, fontSize: '0.85rem', marginBottom: 4 }}>Guaranteed Monthly Income</div>
                      <div style={{ fontSize: '3rem', fontWeight: 900, color: GOLD }}>${annuityResults.monthlyIncome.toLocaleString()}</div>
                      <div style={{ color: MUTED, fontSize: '0.85rem' }}>Starting at age {annuityQuote.age + annuityQuote.deferral}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[['Annual Income', `$${annuityResults.annualIncome.toLocaleString()}`], ['Income Base', `$${annuityResults.incomeBase.toLocaleString()}`]].map(([k, v]) => (
                        <div key={k} style={{ background: '#0B0F17', borderRadius: 10, padding: '1rem', border: `1px solid #2a3548` }}>
                          <div style={{ color: MUTED, fontSize: '0.75rem', marginBottom: 4 }}>{k}</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: INK }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: `${GOLD}15`, border: `2px solid ${GOLD}66`, borderRadius: 12, padding: '1.25rem' }}>
                      <div style={{ fontWeight: 700, color: GOLD, marginBottom: 6 }}>Lifetime Income Potential</div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: INK }}>${annuityResults.lifetimeIncome.toLocaleString()}</div>
                      <div style={{ color: MUTED, fontSize: '0.85rem', marginTop: 4 }}>Over 25 years • {annuityResults.totalReturn}% total return</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={card}>
                <h3 style={{ margin: '0 0 1rem', color: INK, fontWeight: 700 }}>Product Features</h3>
                {annuityQuote.product === 'safe-income' && (
                  <div style={{ color: MUTED, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>📈 <strong style={{ color: INK }}>7.20% Guaranteed Roll-Up</strong> — for first 10 years or until income starts</div>
                    <div>🛡️ <strong style={{ color: INK }}>Principal Protection</strong> — never lose money due to market downturns</div>
                  </div>
                )}
                <div style={{ color: MUTED, fontSize: '0.9rem', marginTop: 12 }}>💵 <strong style={{ color: INK }}>Lifetime Income Guarantee</strong> — payments continue for life, even if account depletes</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                  <button onClick={() => window.open(FILLOUT_URL, '_blank')} style={{ width: '100%', padding: '1rem', borderRadius: 10, background: GOLD, color: NAVY, fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer' }}>
                    📞 Speak with Retirement Specialist
                  </button>
                  <button onClick={() => window.print()} style={{ width: '100%', padding: '1rem', borderRadius: 10, background: 'transparent', color: GOLD, fontWeight: 700, fontSize: '1rem', border: `2px solid ${GOLD}`, cursor: 'pointer' }}>
                    ⬇️ Save This Quote
                  </button>
                </div>
                <p style={{ color: MUTED, fontSize: '0.75rem', textAlign: 'center', marginTop: 8 }}>Hypothetical illustration. Actual values may vary by contract.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div style={{ ...card, marginTop: 24, textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 800, color: INK }}>Ready to Move Forward?</h3>
          <p style={{ color: MUTED, margin: '0 0 1.5rem', maxWidth: 520, marginInline: 'auto' }}>
            These are estimated quotes. Let's discuss your specific situation and build the right solution for your family.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => window.open(FILLOUT_URL, '_blank')} style={{ padding: '1rem 2rem', borderRadius: 10, background: GOLD, color: NAVY, fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
              ✉️ Request Official Quote
            </button>
            <a href={`tel:7176152613`} style={{ display: 'inline-block', padding: '1rem 2rem', borderRadius: 10, border: `2px solid ${GOLD}`, color: GOLD, fontWeight: 800, textDecoration: 'none', fontSize: '1rem' }}>
              📞 Call {PHONE}
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
