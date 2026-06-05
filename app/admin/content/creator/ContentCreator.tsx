'use client'

import { useState, useEffect } from 'react'
import PageHeader from '../../_components/PageHeader'

interface GeneratedPost {
  title: string
  draft: string
  platform: string
  hashtags: string[]
}

export default function ContentCreatorContent() {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('linkedin')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [selectedPostIdx, setSelectedPostIdx] = useState<number | null>(null)
  const [schedulingDate, setSchedulingDate] = useState('')
  const [schedulingTime, setSchedulingTime] = useState('09:00')

  useEffect(() => {
    console.log('generatedPosts changed:', generatedPosts)
  }, [generatedPosts])

  useEffect(() => {
    console.log('selectedPostIdx changed:', selectedPostIdx)
  }, [selectedPostIdx])

  // Load mock data for testing preview functionality
  useEffect(() => {
    const loadMockData = () => {
      const mockPosts: GeneratedPost[] = [
        {
          title: "Estate Planning for Families",
          draft: "Planning for the future is one of the kindest things you can do for your family right here in Schuylkill County. It isn't about the end; it's about making sure your children and grandchildren are taken care of, no matter what happens. When my father, Jackson M. Latimore Sr., faced his cardiac arrest, it was our family's preparation that kept his legacy strong. We want to help you create that same peace of mind. Estate planning is simply a map that shows your family how much you care. Protecting Today. Securing Tomorrow.",
          platform: "facebook",
          hashtags: ["#TheBeatGoesOn", "#FamilyLegacy", "#CentralPA", "#PeaceOfMind"]
        },
        {
          title: "Building a Strong Foundation",
          draft: "Living here in Central PA, we know the value of hard work and looking out for our neighbors. Estate planning isn't just about paperwork; it's about making sure your family is taken care of no matter what. At Latimore Life & Legacy, we help you turn your hard work into a lasting legacy for your kids and grandkids. Let's make sure your family's future is solid. Protecting Today. Securing Tomorrow.",
          platform: "facebook",
          hashtags: ["#TheBeatGoesOn", "#CentralPA", "#FamilyLegacy", "#EstatePlanning"]
        },
        {
          title: "Simple Steps for Your Family's Future",
          draft: "Many families in our area think estate planning is too complicated or only for the wealthy. But really, it is just about having a plan so your loved ones don't have to guess. Whether it's choosing who will look after your kids or how to pass down a family business, we are here to guide you every step of the way. Let's work together to make sure your family's story continues just the way you want it to. Protecting Today. Securing Tomorrow.",
          platform: "facebook",
          hashtags: ["#TheBeatGoesOn", "#SchuylkillCounty", "#FamilyProtection", "#SecureTheFuture"]
        }
      ]
      setGeneratedPosts(mockPosts)
      setSelectedPostIdx(0)
    }

    // Load mock data after a short delay to simulate loading
    const timer = setTimeout(loadMockData, 1000)
    return () => clearTimeout(timer)
  }, [])

  const platforms = [
    { value: 'linkedin', label: 'LinkedIn', icon: 'fa-linkedin' },
    { value: 'facebook', label: 'Facebook', icon: 'fa-facebook' },
    { value: 'instagram', label: 'Instagram', icon: 'fa-instagram' },
    { value: 'twitter', label: 'Twitter', icon: 'fa-twitter' },
  ]

  const handleGenerate = async () => {
    console.log('handleGenerate called, topic:', topic, 'trimmed:', topic.trim())
    if (!topic.trim()) {
      console.log('Topic is empty, showing alert')
      alert('Please enter a topic')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/admin/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          platform,
          count: 3,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate content')

      const data = await response.json()
      console.log('API Response:', data)
      console.log('Posts array:', data.posts)
      setGeneratedPosts(data.posts || [])
      console.log('Set generatedPosts to:', data.posts || [])
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate content. Ensure AI provider is configured.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSchedulePost = async (post: GeneratedPost) => {
    if (!schedulingDate || !schedulingTime) {
      alert('Please select a date and time for scheduling')
      return
    }

    try {
      const scheduledFor = new Date(`${schedulingDate}T${schedulingTime}:00`)

      const response = await fetch('/api/admin/social-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title,
          bodyText: post.draft,
          channel: post.platform,
          type: 'social_post',
          scheduledFor: scheduledFor.toISOString(),
          metadata: {
            hashtags: post.hashtags,
            platform: post.platform
          }
        }),
      })

      if (!response.ok) throw new Error('Failed to schedule post')

      // Remove from generated posts
      setGeneratedPosts(generatedPosts.filter((_, i) => i !== selectedPostIdx))
      setSelectedPostIdx(null)

      // Reset scheduling form
      setSchedulingDate('')
      setSchedulingTime('09:00')

      alert('Post scheduled successfully!')
    } catch (error) {
      console.error('Scheduling error:', error)
      alert('Failed to schedule post')
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="Content Strategy"
        title="Content Architect"
        description="AI-powered social media content generation and scheduling"
      />

      {/* Generation Form */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
        <h3 className="text-lg font-black text-white mb-6">Generate Content</h3>

        <div className="space-y-6">
          {/* Topic Input */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Topic / Theme</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'Mortgage protection for new homeowners'"
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A25F]"
              onKeyPress={() => {
                // Temporarily disabled to prevent accidental generation
              }}
            />
          </div>

          {/* Platform Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Target Platform</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {platforms.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPlatform(p.value)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 transition ${
                    platform === p.value
                      ? 'border-[#C9A25F] bg-[#C9A25F]/10 text-[#C9A25F]'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <i className={`fa-brands ${p.icon}`}></i>
                  <span className="text-sm font-semibold">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-[#C9A25F] hover:bg-[#D4AF77] disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-black py-3 rounded-xl transition"
          >
            {isGenerating ? 'Generating...' : 'Generate Posts'}
          </button>
        </div>
      </div>

      {/* Generated Posts & Scheduled Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generated Posts */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h3 className="text-lg font-black text-white mb-6">Generated Posts ({generatedPosts.length})</h3>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {generatedPosts.map((post, idx) => (
              <button
                key={idx}
                onClick={() => {
                  console.log('Setting selectedPostIdx to:', idx)
                  setSelectedPostIdx(idx)
                }}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  selectedPostIdx === idx
                    ? 'border-[#C9A25F] bg-[#C9A25F]/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <p className="text-sm font-semibold text-white">{post.title}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{post.draft}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Post Preview */}
        {selectedPostIdx !== null && (
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 flex flex-col">
            <h3 className="text-lg font-black text-white mb-6">Preview & Schedule</h3>

            <div className="flex-1 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Title</p>
                <p className="text-white font-semibold mt-2">{generatedPosts[selectedPostIdx].title}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Post Content</p>
                <div className="mt-2 bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-white whitespace-pre-wrap text-sm">{generatedPosts[selectedPostIdx].draft}</p>
                </div>
              </div>

              {generatedPosts[selectedPostIdx].hashtags && generatedPosts[selectedPostIdx].hashtags.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Hashtags</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {generatedPosts[selectedPostIdx].hashtags.map((tag, i) => (
                      <span key={i} className="text-[#C9A25F] text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduling Options */}
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Schedule Post</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Date</label>
                    <input
                      type="date"
                      value={schedulingDate}
                      onChange={(e) => setSchedulingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A25F]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Time</label>
                    <input
                      type="time"
                      value={schedulingTime}
                      onChange={(e) => setSchedulingTime(e.target.value)}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A25F]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleSchedulePost(generatedPosts[selectedPostIdx])}
                className="flex-1 bg-[#C9A25F] hover:bg-[#D4AF77] text-slate-900 font-black py-2 rounded-lg transition"
              >
                Schedule Post
              </button>
              <button
                onClick={() => {
                  setGeneratedPosts(generatedPosts.filter((_, i) => i !== selectedPostIdx))
                  setSelectedPostIdx(null)
                }}
                className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold py-2 rounded-lg transition"
              >
                Discard
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Empty State */}
      {generatedPosts.length === 0 && (
        <div className="text-center py-12">
          <i className="fa-solid fa-pen-nib text-5xl text-slate-500 mb-4"></i>
          <p className="text-slate-400 text-lg">Generate your first post to get started</p>
        </div>
      )}
    </div>
  )
}