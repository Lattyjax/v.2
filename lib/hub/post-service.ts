import slugify from 'slugify'
import type { Post, PostComment, PostReaction } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { ingestEvent } from '@/lib/hub/ingest-event'
import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { logger } from '@/lib/logger'

type PostWithRelations = Post & {
  comments: PostComment[]
  reactions: PostReaction[]
}

type ModerationResult = { isFlagged: boolean; reason: string }

async function moderateContent(text: string): Promise<ModerationResult> {
  const result = await createOpenAIJsonCompletion<ModerationResult>({
    system:
      'You are a content moderation assistant. Evaluate whether the provided text contains harmful, offensive, illegal, or inappropriate content.',
    user: text,
    schemaName: 'ModerationResult',
    schema: {
      type: 'object',
      properties: {
        isFlagged: { type: 'boolean', description: 'true if content should be flagged for review' },
        reason: { type: 'string', description: 'brief reason if flagged, empty string if not' },
      },
      required: ['isFlagged', 'reason'],
      additionalProperties: false,
    },
    temperature: 0,
  })
  return result.output
}

class PostService {
  async list(page = 1, limit = 20, tag?: string) {
    const where = {
      status: 'published' as const,
      deletedAt: null,
      ...(tag ? { tags: { has: tag } } : {}),
    }
    const [data, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.post.count({ where }),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findBySlug(slug: string): Promise<PostWithRelations | null> {
    const post = await prisma.post.findUnique({ where: { slug } })
    if (!post || post.deletedAt || post.status !== 'published') return null

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
      include: { comments: true, reactions: true },
    })

    void ingestEvent({
      eventType: 'post_viewed',
      metadata: { postId: post.id, slug },
    })

    return updated
  }

  async create(
    createdBy: string,
    data: { title: string; body: string; tags: string[] }
  ): Promise<Post> {
    const base = slugify(data.title, { lower: true, strict: true })
    const slug = `${base}-${Date.now()}`

    let status: 'draft' | 'flagged' = 'draft'

    try {
      const moderation = await moderateContent(`${data.title}\n\n${data.body}`)
      if (moderation.isFlagged) {
        status = 'flagged'
        logger.warn({ createdBy, reason: moderation.reason }, '[PostService] content flagged')
      }
    } catch (err) {
      logger.error({ err }, '[PostService] moderation check failed — defaulting to draft')
    }

    const post = await prisma.post.create({
      data: { ...data, slug, createdBy, status },
    })

    void ingestEvent({
      eventType: 'post_created',
      metadata: { postId: post.id, createdBy, title: data.title, isFlagged: status === 'flagged' },
    })

    return post
  }

  async publish(id: string): Promise<Post> {
    const post = await prisma.post.update({
      where: { id },
      data: { status: 'published', publishedAt: new Date() },
    })

    void ingestEvent({
      eventType: 'post_published',
      metadata: {
        postId: post.id,
        createdBy: post.createdBy,
        slug: post.slug,
        tags: post.tags,
        wordCount: post.body.split(' ').length,
      },
    })

    return post
  }

  async toggleReaction(
    postId: string,
    userId: string,
    emoji: string
  ): Promise<{ toggled: 'added' | 'removed'; emoji: string; reaction?: PostReaction }> {
    const existing = await prisma.postReaction.findFirst({ where: { postId, userId, emoji } })

    if (existing) {
      await prisma.postReaction.delete({ where: { id: existing.id } })
      return { toggled: 'removed', emoji }
    }

    const reaction = await prisma.postReaction.create({ data: { postId, userId, emoji } })

    void ingestEvent({
      eventType: 'reaction_added',
      metadata: { postId, userId, emoji },
    })

    return { toggled: 'added', emoji, reaction }
  }
}

export const postService = new PostService()
