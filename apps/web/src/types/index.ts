import { Component, User, Vote, Suggestion } from '@openui/database'
import { DefaultSession } from 'next-auth'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}

// Sort options for feed
export type SortOption = 'hot' | 'new' | 'top'

// Component with author and counts for feed display
export type ComponentWithAuthor = Component & {
  author: Pick<User, 'username' | 'avatarUrl'>
  _count: {
    votes: number
    suggestions: number
    forks: number
  }
}

// Component with full relations for detail page
export type ComponentWithDetails = Component & {
  author: Pick<User, 'id' | 'username' | 'avatarUrl' | 'bio'>
  forkedFrom: (Component & {
    author: Pick<User, 'username'>
  }) | null
  forks: (Component & {
    author: Pick<User, 'username' | 'avatarUrl'>
  })[]
  suggestions: (Suggestion & {
    author: Pick<User, 'username' | 'avatarUrl'>
  })[]
  _count: {
    votes: number
    suggestions: number
    forks: number
  }
}

// User vote state
export type UserVote = 1 | -1 | null

// Feed response from API
export interface FeedResponse {
  items: ComponentWithAuthor[]
  nextCursor: string | null
}

// API error response
export interface ApiError {
  error: string
}
