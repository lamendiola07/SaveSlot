import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

export interface TaggedGame {
  id: number
  title: string
  cover: string
}

export interface Post {
  id: string
  userId: string
  username: string
  pfpUrl: string | null
  content: string
  mediaUrl?: string
  mediaType?: 'image' | 'video'
  taggedUsers: string[]
  taggedGame?: TaggedGame
  createdAt: string
  likes: number
  likedBy: string[]
}

interface PostsState {
  posts: Post[]
  addPost: (data: Omit<Post, 'id' | 'createdAt' | 'likes' | 'likedBy'>) => void
  likePost: (postId: string, userId: string) => void
  editPost: (postId: string, content: string) => void
  deletePost: (postId: string) => void
}

const POSTS_KEY = 'saveslot_posts'
function loadPosts(): Post[] {
  try { return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]') } catch { return [] }
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: loadPosts(),
  addPost: (data) => {
    const post: Post = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString(), likes: 0, likedBy: [] }
    set(state => {
      const posts = [post, ...state.posts]
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
      return { posts }
    })
  },
  likePost: (postId, userId) => {
    set(state => {
      const posts = state.posts.map(p => {
        if (p.id !== postId) return p
        const liked = p.likedBy.includes(userId)
        return { ...p, likes: liked ? p.likes - 1 : p.likes + 1, likedBy: liked ? p.likedBy.filter(id => id !== userId) : [...p.likedBy, userId] }
      })
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
      return { posts }
    })
  },
  editPost: (postId, content) => {
    set(state => {
      const posts = state.posts.map(p => p.id === postId ? { ...p, content } : p)
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
      return { posts }
    })
  },
  deletePost: (postId) => {
    set(state => {
      const posts = state.posts.filter(p => p.id !== postId)
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
      return { posts }
    })
  },
}))

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))

interface SearchState {
  query: string
  ordering?: string
  dates?: string
  setQuery: (query: string) => void
  setFilters: (filters: { ordering?: string; dates?: string }) => void
  clearFilters: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  ordering: undefined,
  dates: undefined,
  setQuery: (query) => set({ query }),
  setFilters: (filters) => set(filters),
  clearFilters: () => set({ query: '', ordering: undefined, dates: undefined }),
}))
