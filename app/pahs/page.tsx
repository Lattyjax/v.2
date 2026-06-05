'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './pahs.css';

type LeadForm = {
  name: string;
  phone: string;
  email: string;
  promo: string;
  interest: string;
};

type ContactCard = {
  href: string;
  icon: string;
  label: string;
  value: string;
  external?: boolean;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err?.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

const PAGE_URL = 'https://latimorelifelegacy.fillout.com/pahs';

const SERVICES = [
  ['01', 'Life Insurance', 'Term and permanent coverage through Ethos Life, Foresters Financial, North American Company, and more. Affordable protection built for real budgets.'],
  ['02', 'Living Benefits', "Policies that pay while you're still living — critical illness, chronic illness, and terminal illness riders that deliver cash when you need it most."],
  ['03', 'Indexed Universal Life (IUL)', 'Tax-advantaged growth linked to market indices with downside protection. Powerful for income planning, legacy building, and supplemental retirement.'],
  ['04', 'Fixed Index Annuities (FIA)', "Guaranteed income through F&G, American Equity, and Corebridge Financial. Sleep well knowing you won't outlive your money."],
  ['05', 'Estate & Legacy Planning', 'Structure your assets so your family receives more of what you built — with clarity, dignity, and minimal friction.'],
  ['06', 'Mortgage Protection Term', 'Keep your family in the home no matter what happens. Affordable term coverage tied to your mortgage payoff schedule.'],
];

const CONTACT_CARDS: ContactCard[] = [
  {
    href: '#intakeFormSection',
    icon: '📋',
    label: 'Free Protection Review',
    value: 'Get Started — Takes 2 Min',
  },
  {
    href: 'tel:+17176152613',
    icon: '☎️',
    label: 'Call Jackson Direct',
    value: '(717) 615-2613',
  },
  {
    href: 'mailto:leads@latimorelegacy.com',
    icon: '✉️',
    label: 'Email Jackson',
    value: 'leads@latimorelegacy.com',
  },
  {
    href: 'https://agents.ethoslife.com/invite/29ad1',
    icon: '📝',
    label: 'Get a Term Life Quote',
    value: 'Apply Online via Ethos',
    external: true,
  },
  {
    href: 'https://www.instagram.com/jacksonlatimore.global?igsh=MTI5N25yNzR4emlieQ==',
    icon: '📸',
    label: 'Follow on Instagram',
    value: '@jacksonlatimore.global',
    external: true,
  },
  {
    href: 'https://www.facebook.com/LatimoreLegacyLLC/',
    icon: '📘',
    label: 'Follow on Facebook',
    value: '@LatimoreLegacyLLC',
    external: true,
  },
  {
    href: 'https://www.linkedin.com/in/startwithjacksongfi?trk=contact-info',
    icon: '💼',
    label: 'Connect on LinkedIn',
    value: 'Jackson M. Latimore Sr.',
    external: true,
  },
];

export default function PAHSPage() {
  const [lead, setLead] = useState<LeadForm>({
    name: '',
    phone: '',
    email: '',
    promo: '',
    interest: '',
  });

  const [leadStatus, setLeadStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [leadError, setLeadError] = useState('');

  const [legacyRecipient, setLegacyRecipient] = useState('');
  const [legacyMessage, setLegacyMessage] = useState('');
  const [legacyTone, setLegacyTone] = useState('Heartfelt and loving');
  const [legacyOutput, setLegacyOutput] = useState('');
  const [legacyLoading, setLegacyLoading] = useState(false);
  const [legacyError, setLegacyError] = useState('');

  const [jargon, setJargon] = useState('');
  const [jargonOutput, setJargonOutput] = useState('');
  const [jargonLoading, setJargonLoading] = useState(false);
  const [jargonError, setJargonError] = useState('');

  const [showSticky, setShowSticky] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    const onScroll = () => {
      setShowSticky(window.scrollY > window.innerHeight * 0.6);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      revealObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  async function submitLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLeadStatus('submitting');
    setLeadError('');

    try {
      await postJson<{ ok: boolean }>('/api/pahs-lead', {
        ...lead,
        source: 'PAHS Sponsorship Page',
        page: 'www.latimorelifelegacy.com/pahs',
      });

      setLeadStatus('success');
    } catch (err) {
      setLeadStatus('error');
      setLeadError(err instanceof Error ? err.message : 'Lead submission failed.');
    }
  }

  async function generateLegacyLetter() {
    setLegacyLoading(true);
    setLegacyError('');
    setLegacyOutput('');
    setCopyStatus('');

    try {
      const data = await postJson<{ text: string }>('/api/gemini/legacy-letter', {
        recipient: legacyRecipient || 'My Loved Ones',
        message:
          legacyMessage ||
          'I want you to know how much I love you and that I will always be looking out for you.',
        tone: legacyTone,
      });

      setLegacyOutput(data.text);
    } catch (err) {
      setLegacyError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLegacyLoading(false);
    }
  }

  async function translateJargon() {
    if (!jargon.trim()) return;

    setJargonLoading(true);
    setJargonError('');
    setJargonOutput('');

    try {
      const data = await postJson<{ text: string }>('/api/gemini/jargon', { jargon });
      setJargonOutput(data.text);
    } catch (err) {
      setJargonError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setJargonLoading(false);
    }
  }

  async function copyLegacyLetter() {
    try {
      await navigator.clipboard.writeText(legacyOutput);
      setCopyStatus('Copied.');
    } catch {
      setCopyStatus('Copy failed.');
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-ov" />

        <div className="hero-content">
          <div className="sponsor-badge">Proud All-Star Sponsor</div>

          <div className="hero-school-name">
            POTTSVILLE AREA
            <br />
            HIGH SCHOOL
          </div>

          <div className="hero-year">Crimson Tide &middot; Class of &apos;26</div>

          <div className="hero-profile">
            <img src="/jackson-headshot.jpg" alt="Jackson M. Latimore Sr." className="hero-profile-img" />
          </div>

          <div className="logos-row">
            <div className="tide-logo-container logo-card">
              <img
                src="/pahs-tide-logo.png"
                alt="Pottsville Area High School Crimson Tide logo"
                className="team-logo-image"
              />
            </div>

            <div className="logo-divider" />

            <div className="latimore-logo-container logo-card">
              <img
                src="/pahs-latimore-logo.png"
                alt="Latimore Life &amp; Legacy logo"
                className="business-logo-image"
              />
            </div>
          </div>

          <svg className="hbeat" viewBox="0 0 200 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline
              points="0,15 34,15 42,4 48,26 54,10 60,20 66,15 100,15 108,2 116,28 122,8 128,22 134,15 200,15"
              stroke="#C49A6C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
          </svg>

          <div className="hero-tagline">Protecting Today. Securing Tomorrow. #TheBeatGoesOn</div>

          <div className="hero-ctas">
            <a href="tel:+17176152613" className="btn1">Schedule Free Consultation</a>
            <a href="#story" className="btn2">The Full Circle Story &darr;</a>
          </div>
        </div>
      </section>

      <section className="spgfx">
        <img src="/pahs-sponsor-flyer.png" alt="Proud All-Star Sponsor — Pottsville Area High School ‘26" />
      </section>

      <section className="campaign-videos">
        <div className="campaign-videos-inner">
          <div className="section-label gold-label">Campaign Videos</div>
          <h2 className="campaign-videos-title">Watch the Campaign</h2>
          <div className="videos-grid">
            <div className="video-wrap">
              <iframe
                loading="lazy"
                src="https://www.canva.com/design/DAHLhIdBi1g/XrwK0tvOGXRX57S6xQtgdA/watch?embed"
                allowFullScreen
                allow="fullscreen"
                title="PAHS Campaign Video 1"
              />
            </div>
            <div className="video-wrap">
              <iframe
                loading="lazy"
                src="https://www.canva.com/design/DAHLhNdroHQ/DSj1SN6LGJKvtoSIqk8hmQ/watch?embed"
                allowFullScreen
                allow="fullscreen"
                title="PAHS Campaign Video 2"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="cta-strip reveal">
        <h2>GET YOUR FREE PROTECTION REVIEW</h2>
        <p>No pressure. Just clarity. One conversation can change your family&apos;s future.</p>

        <div className="cta-buttons">
          <a href="#intakeFormSection" className="btn-primary">
            📋 Start My Free Review
          </a>
          <a href="tel:+17176152613" className="btn-secondary">
            ☎️ Call Jackson Direct
          </a>
        </div>
      </section>

      <section className="intake-section" id="intakeFormSection">
        <div className="intake-inner reveal">
          <div className="section-label">Take Action</div>

          <h2>Claim Your Free Consultation</h2>

          <p>
            Whether you&apos;re redeeming your Football Game Day Coupon or simply want to review your
            protection, take the first step toward securing your family&apos;s future. Fill out the
            form below.
          </p>

          <div className="intake-box">
            {leadStatus !== 'success' ? (
              <form className="intake-form" onSubmit={submitLead}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ifName">Full Name *</label>
                    <input
                      id="ifName"
                      name="name"
                      className="form-control"
                      placeholder="John Doe"
                      required
                      value={lead.name}
                      onChange={e => setLead({ ...lead, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="ifPhone">Phone Number *</label>
                    <input
                      id="ifPhone"
                      name="phone"
                      className="form-control"
                      placeholder="(555) 555-5555"
                      required
                      value={lead.phone}
                      onChange={e => setLead({ ...lead, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ifEmail">Email Address</label>
                    <input
                      id="ifEmail"
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder="john@example.com"
                      value={lead.email}
                      onChange={e => setLead({ ...lead, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="ifPromo">Coupon / Promo Code</label>
                    <input
                      id="ifPromo"
                      name="promo"
                      className="form-control"
                      placeholder="e.g. ID#2777749"
                      value={lead.promo}
                      onChange={e => setLead({ ...lead, promo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="ifInterest">What are you most interested in? *</label>
                  <select
                    id="ifInterest"
                    name="interest"
                    className="form-control"
                    required
                    value={lead.interest}
                    onChange={e => setLead({ ...lead, interest: e.target.value })}
                  >
                    <option value="" disabled>
                      Select an option...
                    </option>
                    <option>Life Insurance & Living Benefits</option>
                    <option>Retirement & Annuities</option>
                    <option>Legacy & Estate Planning</option>
                    <option>Mortgage Protection</option>
                    <option>General Financial Review</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={leadStatus === 'submitting'}
                  className="btn-primary full-width"
                >
                  {leadStatus === 'submitting' ? 'Submitting...' : '📨 Request My Free Review'}
                </button>

                {leadStatus === 'error' && <div className="error-msg">{leadError}</div>}
              </form>
            ) : (
              <div className="success-msg">
                <span>✅</span>
                <div>
                  <strong>Thank you!</strong> Your request was received. Jackson will follow up
                  soon.
                </div>
              </div>
            )}

            <a
              href="https://latimorelifelegacy.fillout.com/pahs"
              className="intake-external-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Prefer our detailed intake questionnaire? Click here.
            </a>
          </div>
        </div>
      </section>

      <section className="story-section" id="story">
        <div className="story-inner reveal">
          <div className="story-copy">
          <div className="section-label">The Full Circle Legacy</div>

          <h2>
            From the Field
            <br />to the <em>Family</em>
          </h2>

          <div className="story-year-badge">2005 &rarr; 2026</div>

          <p className="story-text">
            Jackson M. Latimore Sr. wore <strong>#20 for Cardinal Brennan</strong>, earning
            Republican &amp; Herald All-Area Offensive Player of the Year honors in 2005. He knows
            what it means to compete in the Coal Region — the early mornings, the community that
            shows up, the weight of a jersey.
          </p>

          <div className="date-callout">
            <div className="date">December 7, 2010</div>
            <p>
              &ldquo;A cardiac arrest at ESU&apos;s Koehler Fieldhouse nearly ended my story. An
              AED funded by the Gregory W. Moyer Defibrillator Fund saved my life.{' '}
              <strong>#TheBeatGoesOn.</strong>&rdquo;
            </p>
          </div>

          <p className="story-text">
            That moment — watching a prepared community save a life — is the heartbeat behind
            everything we do at <strong>Latimore Life &amp; Legacy LLC.</strong>
          </p>

          <p className="story-text">
            We don&apos;t sell fear. We help{' '}
            <strong>families in Schuylkill, Luzerne, and Northumberland counties</strong> prepare
            for life&apos;s uncertainties with clarity and confidence — because legacy isn&apos;t
            just what you leave behind. It&apos;s how you show up today.
          </p>

          <p className="story-text">
            Supporting PAHS football is one way we put our mission into action —{' '}
            <strong>right here, in our community.</strong>
          </p>

          <span className="hashtag">#TheBeatGoesOn 🏈 #LatimoreLifeAndLegacy</span>
          </div>

          <div className="story-image-wrap">
            <div className="retro-card">
              <div className="retro-card-inner">
                <div className="retro-card-hdr">
                  <div className="retro-card-title">Pottsville caps magical season</div>
                  <div className="retro-card-sub">Tide&rsquo;s Keating, Buziak, DeMarkis join CB&rsquo;s Latimore atop team</div>
                </div>
                <img
                  src="/pahs-2005-allarea.png"
                  alt="2005 Republican &amp; Herald All-Area Football — Jackson Latimore named Offensive Player of the Year"
                />
                <div className="retro-card-cap">
                  Headlining the 2005 R&amp;H All-Area Football Team — Jackson Latimore (#20, Cardinal Brennan)
                  named Offensive Player of the Year. Photo: Jacqueline Dormer / Staff Photo.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="why-inner reveal">
          <div className="section-label gold-label">Why Latimore Life &amp; Legacy</div>
          <h2>Built for <em>Coal Region</em> Families</h2>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-title">Protecting Today</div>
              <p className="why-body">
                Life insurance and living-benefit solutions that safeguard your family&apos;s
                financial foundation — starting now, not someday.
              </p>
            </div>
            <div className="why-card">
              <div className="why-title">Securing Tomorrow</div>
              <p className="why-body">
                Index-linked annuities and IUL strategies designed to grow your wealth — with
                downside protection built in.
              </p>
            </div>
            <div className="why-card">
              <div className="why-title">Invested in Community</div>
              <p className="why-body">
                Proud All-Star sponsor of PAHS Crimson Tide football. Rooted in Schuylkill,
                Luzerne, and Northumberland Counties.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="services-inner reveal">
          <div className="section-label">What We Do</div>

          <h2>
            Your Complete
            <br />
            Financial Protection Team
          </h2>

          <p className="services-subtitle">
            From your first policy to your retirement paycheck — we&apos;ve got Central Pennsylvania
            covered.
          </p>

          <div className="services-grid">
            {SERVICES.map(([num, title, desc]) => (
              <div className="service-card" key={title}>
                <div className="service-num">{num}</div>
                <div>
                  <h3>{title}</h3>
                  <p className="service-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cpn">
        <div className="cpn-inner">
          <img
            src="/pahs-free-consult.png"
            alt="Free Consultation — Proud Sponsor of Pottsville Area Crimson Tide · ID #2777749"
          />
          <div className="cpn-note">Powered by Campus Box Media &middot; ID #2777749 &middot; Limit one per transaction</div>
        </div>
      </section>

      <section className="territory-section">
        <div className="territory-inner reveal">
          <h3>Serving</h3>
          <p>Schuylkill · Luzerne · Northumberland</p>
          <p className="county-detail">560,000+ residents across Central Pennsylvania</p>
          <div className="tide-pride">🏈 GO CRIMSON TIDE</div>
        </div>
      </section>

      <section className="campaign-gallery">
        <div className="gallery-inner reveal">
          <div className="section-label">Campaign Assets</div>
          <h2>Official PAHS Sponsorship Campaign</h2>

          <div className="gallery-grid">
            <img src="/pahs-sponsor-flyer.png" alt="Official sponsorship graphic" />
            <img src="/pahs-protect-go.png" alt="Protect and Go campaign graphic" />
            <img src="/pahs-free-consult.png" alt="PAHS QR campaign poster" />
          </div>
        </div>
      </section>

      <section className="legacy-section">
        <div className="legacy-inner reveal">
          <div className="section-label centered gold">Free Digital Tool</div>

          <h2>Draft Your Legacy Letter</h2>

          <p>
            Financial protection is only half the equation. Leave behind your wisdom, values, and
            love. Use our AI assistant to help you draft a meaningful letter to your loved ones.
          </p>

          <div className="legacy-box">
            <div className="form-group">
              <label htmlFor="llRecipient">To Who?</label>
              <input
                id="llRecipient"
                className="form-control"
                placeholder="e.g., My children, Sarah and Michael"
                value={legacyRecipient}
                onChange={e => setLegacyRecipient(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="llMessage">Core Values or Lesson</label>
              <textarea
                id="llMessage"
                className="form-control"
                placeholder="e.g., Always support each other, remember the importance of community, and never give up."
                value={legacyMessage}
                onChange={e => setLegacyMessage(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="llTone">Tone</label>
              <select
                id="llTone"
                className="form-control"
                value={legacyTone}
                onChange={e => setLegacyTone(e.target.value)}
              >
                <option>Heartfelt and loving</option>
                <option>Encouraging and inspiring</option>
                <option>Wise and reflective</option>
              </select>
            </div>

            <button
              type="button"
              className="btn-gemini"
              disabled={legacyLoading}
              onClick={generateLegacyLetter}
            >
              {legacyLoading ? 'Drafting...' : '✨ Draft My Legacy Letter ✨'}
            </button>

            {legacyError && <div className="error-msg">{legacyError}</div>}

            {legacyOutput && (
              <div className="letter-output-container quoted">
                <div className="letter-content">{legacyOutput}</div>
                <button type="button" className="copy-btn" onClick={copyLegacyLetter}>
                  📋 Copy to Clipboard
                </button>
                {copyStatus && <p className="copy-status">{copyStatus}</p>}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="legacy-section jargon-section">
        <div className="legacy-inner reveal">
          <div className="section-label centered gold">Free Digital Tool</div>

          <h2>Insurance Jargon Translator</h2>

          <p>
            Insurance policies can be confusing. Paste a complicated term or phrase below, and our
            AI assistant will explain it in simple, plain English.
          </p>

          <div className="legacy-box">
            <div className="form-group">
              <label htmlFor="jargonInput">Confusing Term or Phrase</label>
              <textarea
                id="jargonInput"
                className="form-control short-textarea"
                placeholder="e.g., Return of Premium Term or Accelerated Death Benefit Rider"
                value={jargon}
                onChange={e => setJargon(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn-gemini"
              disabled={jargonLoading}
              onClick={translateJargon}
            >
              {jargonLoading ? 'Translating...' : '✨ Translate to Plain English ✨'}
            </button>

            {jargonError && <div className="error-msg">{jargonError}</div>}

            {jargonOutput && (
              <div className="letter-output-container">
                <div className="letter-content plain">{jargonOutput}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-inner reveal">
          <div className="section-label">Let&apos;s Connect</div>

          <h2>Start the Conversation</h2>

          <p>A 15-minute call is all it takes to know exactly where you stand.</p>

          <div className="contact-cards">
            {CONTACT_CARDS.map(card => (
              <a
                href={card.href}
                className="contact-card"
                key={card.label}
                target={card.external ? '_blank' : undefined}
                rel={card.external ? 'noopener noreferrer' : undefined}
              >
                <div className="contact-card-icon">{card.icon}</div>
                <div className="contact-card-text">
                  <div className="contact-card-label">{card.label}</div>
                  <div className="contact-card-value">{card.value}</div>
                </div>
                <span className="contact-card-arrow">›</span>
              </a>
            ))}
          </div>

          <a href="#intakeFormSection" className="btn-primary contact-main-btn">
            🛡️ Get My Free Protection Review
          </a>
        </div>
      </section>

      <footer className="footer">
        <a
          href="https://www.latimorelifelegacy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-home-link"
        >
          <div className="footer-logo">LATIMORE LIFE & LEGACY LLC</div>
        </a>

        <div className="footer-tagline">Protecting Today. Securing Tomorrow.</div>
        <div className="footer-hashtag">#TheBeatGoesOn · #LifeHappensLegacyIsPlanned</div>

        <div className="footer-socials">
          <a href="tel:+17176152613">☎️</a>
          <a href="mailto:jackson1989@latimorelegacy.com">✉️</a>
          <a href="https://www.facebook.com/LatimoreLegacyLLC/" target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
          <a
            href="https://www.instagram.com/jacksonlatimore.global?igsh=MTI5N25yNzR4emlieQ=="
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://www.linkedin.com/in/startwithjacksongfi?trk=contact-info"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a href="https://agents.ethoslife.com/invite/29ad1" target="_blank" rel="noopener noreferrer">
            Ethos
          </a>
        </div>

        <div className="footer-disclaimer">
          Jackson M. Latimore Sr., MBA · Founder &amp; CEO · Latimore Life &amp; Legacy LLC · GFI
          Affiliate
          <br />
          1544 Route 61 Hwy S, Suite 6104, Pottsville, PA 17901
          <br />
          Licensed in Pennsylvania · NIPR #21638507 · PA D.O.I. License #1268820
          <br />
          Schuylkill · Luzerne · Northumberland Counties ·{' '}
          <a href="https://www.latimorelifelegacy.com" target="_blank" rel="noopener noreferrer">
            www.latimorelifelegacy.com
          </a>
          <br />
          <br />
          Latimore Life &amp; Legacy LLC is an independent insurance brokerage licensed in the
          Commonwealth of Pennsylvania. Products offered through licensed carrier appointments. Not
          all products available in all areas. Affiliated with Global Financial Impact (GFI).
          Insurance products are not FDIC insured, not bank guaranteed, and may lose value. This
          page is intended for informational purposes and does not constitute financial, legal, or
          tax advice. Proud All-Star sponsor of Pottsville Area High School Football 2026.
        </div>
      </footer>

      <div className={`sticky-cta ${showSticky ? 'show' : ''}`}>
        <div className="sticky-cta-text">
          <span>Free</span> Protection Review
        </div>
        <a href="#intakeFormSection" className="sticky-btn">
          Start Now
        </a>
      </div>
    </main>
  );
                }
