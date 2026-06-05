'use client'

import { useState, useEffect } from 'react'
import PageHeader from '../../_components/PageHeader'

interface ScheduledPost {
  id: string
  title: string
  bodyText: string
  channel: string
  status: string
  scheduledFor: string | null
  createdAt: string
  metadata?: any
}

export default function SchedulePage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'draft' | 'published'>('all')

  useEffect(() => {
    fetchPosts()
  }, [filter])

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.set('status', filter)
      }

      const response = await fetch(`/api/admin/social-posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled'
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400 bg-blue-500/10'
      case 'published': return 'text-green-400 bg-green-500/10'
      case 'draft': return 'text-yellow-400 bg-yellow-500/10'
      default: return 'text-slate-400 bg-slate-500/10'
    }
  }

  const publishNow = async (postId: string) => {
    try {
      const response = await fetch('/api/content/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: postId })
      })

      if (response.ok) {
        fetchPosts() // Refresh the list
        alert('Post published successfully!')
      } else {
        alert('Failed to publish post')
      }
    } catch (error) {
      console.error('Publish error:', error)
      alert('Failed to publish post')
    }
  }

  const getPlatformIcon = (channel: string) => {
    switch (channel) {
      case 'linkedin': return 'fa-linkedin'
      case 'facebook': return 'fa-facebook'
      case 'instagram': return 'fa-instagram'
      case 'twitter': return 'fa-twitter'
      default: return 'fa-share'
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <PageHeader
          eyebrow="Content Planning"
          title="Schedule"
          description="View your scheduled content across all platforms"
        />
        <div className="mt-8 flex justify-center">
          <div className="text-slate-400">Loading scheduled posts...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Content Planning"
        title="Schedule"
        description="View your scheduled content across all platforms"
      />

      {/* Filter Tabs */}
      <div className="mt-8 flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All Posts' },
          { key: 'scheduled', label: 'Scheduled' },
          { key: 'draft', label: 'Drafts' },
          { key: 'published', label: 'Published' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === key
                ? 'bg-[#C9A25F] text-slate-900'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
          <i className="fa-solid fa-calendar-check text-5xl text-slate-500 mb-4"></i>
          <p className="text-slate-400 text-lg mb-2">No posts found</p>
          <p className="text-slate-500 text-sm">
            {filter === 'all' ? 'Create your first post in the Content Creator' : `No ${filter} posts yet`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <i className={`fa-brands ${getPlatformIcon(post.channel)} text-xl text-[#C9A25F]`}></i>
                  <div>
                    <h3 className="text-white font-semibold">{post.title}</h3>
                    <p className="text-xs text-slate-400">
                      Created {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(post.status)}`}>
                  {post.status}
                </span>
              </div>

              <p className="text-slate-300 text-sm mb-4 line-clamp-3">{post.bodyText}</p>

              {post.scheduledFor && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-blue-400">
                    <i className="fa-solid fa-clock"></i>
                    <span>Scheduled for {formatDate(post.scheduledFor)}</span>
                  </div>
                  {post.status === 'scheduled' && (
                    <button
                      onClick={() => publishNow(post.id)}
                      className="text-xs bg-[#C9A25F] hover:bg-[#D4AF77] text-slate-900 px-3 py-1 rounded font-semibold transition"
                    >
                      Publish Now
                    </button>
                  )}
                </div>
              )}

              {post.metadata?.hashtags && post.metadata.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.metadata.hashtags.map((tag: string, i: number) => (
                    <span key={i} className="text-[#C9A25F] text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
