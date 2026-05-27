import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

export interface TaggedGame {
  id: number
  title: string
  cover: string
  rating?: number
  genres?: string[]
  released?: string
}

export interface Comment {
  id: string
  userId: string
  username: string
  pfpUrl: string | null
  content: string
  createdAt: string
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
  gifUrl?: string
  starRating?: number
  createdAt: string
  likes: number
  likedBy: string[]
  comments: Comment[]
  reposts: number
  repostedBy: string[]
}

type NewPostData = Omit<Post, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'comments' | 'reposts' | 'repostedBy'>

interface PostsState {
  posts: Post[]
  addPost: (data: NewPostData) => void
  likePost: (postId: string, userId: string) => void
  editPost: (postId: string, content: string) => void
  deletePost: (postId: string) => void
  addComment: (postId: string, data: Omit<Comment, 'id' | 'createdAt'>) => void
  repostPost: (postId: string, userId: string) => void
}

const POSTS_KEY = 'saveslot_posts'

function loadPosts(): Post[] {
  try {
    const raw: Post[] = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]')
    // Migrate older posts that lack new fields
    return raw.map(p => ({
      ...p,
      comments: p.comments ?? [],
      reposts: p.reposts ?? 0,
      repostedBy: p.repostedBy ?? [],
    }))
  } catch { return [] }
}

function save(posts: Post[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: loadPosts(),

  addPost: (data) => {
    const post: Post = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: [],
      reposts: 0,
      repostedBy: [],
    }
    set(state => {
      const posts = [post, ...state.posts]
      save(posts)
      return { posts }
    })
  },

  likePost: (postId, userId) => {
    set(state => {
      const posts = state.posts.map(p => {
        if (p.id !== postId) return p
        const liked = p.likedBy.includes(userId)
        return {
          ...p,
          likes: liked ? p.likes - 1 : p.likes + 1,
          likedBy: liked ? p.likedBy.filter(id => id !== userId) : [...p.likedBy, userId],
        }
      })
      save(posts)
      return { posts }
    })
  },

  editPost: (postId, content) => {
    set(state => {
      const posts = state.posts.map(p => p.id === postId ? { ...p, content } : p)
      save(posts)
      return { posts }
    })
  },

  deletePost: (postId) => {
    set(state => {
      const posts = state.posts.filter(p => p.id !== postId)
      save(posts)
      return { posts }
    })
  },

  addComment: (postId, data) => {
    const comment: Comment = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    set(state => {
      const posts = state.posts.map(p =>
        p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
      )
      save(posts)
      return { posts }
    })
  },

  repostPost: (postId, userId) => {
    set(state => {
      const posts = state.posts.map(p => {
        if (p.id !== postId) return p
        const reposted = p.repostedBy.includes(userId)
        return {
          ...p,
          reposts: reposted ? p.reposts - 1 : p.reposts + 1,
          repostedBy: reposted ? p.repostedBy.filter(id => id !== userId) : [...p.repostedBy, userId],
        }
      })
      save(posts)
      return { posts }
    })
  },
}))

export interface Friend {
  id: string
  username: string
  pfpUrl: string | null
  status: 'Online' | 'Offline' | 'In-game' | 'Away'
}

export interface ChatMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
}

interface FriendsState {
  friends: Friend[]
  messages: ChatMessage[]
  addFriend: (friend: Friend) => void
  removeFriend: (friendId: string) => void
  sendMessage: (senderId: string, receiverId: string, content: string) => void
}

const FRIENDS_KEY = 'saveslot_friends'
const MESSAGES_KEY = 'saveslot_messages'

function loadFriends(): Friend[] {
  try { return JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]') } catch { return [] }
}

function loadMessages(): ChatMessage[] {
  try { return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]') } catch { return [] }
}

export const useFriendsStore = create<FriendsState>((set) => ({
  friends: loadFriends(),
  messages: loadMessages(),

  addFriend: (friend) => set(state => {
    if (state.friends.some(f => f.id === friend.id)) return state
    const friends = [...state.friends, friend]
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends))
    return { friends }
  }),

  removeFriend: (friendId) => set(state => {
    const friends = state.friends.filter(f => f.id !== friendId)
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends))
    return { friends }
  }),

  sendMessage: (senderId, receiverId, content) => set(state => {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
    }
    const messages = [...state.messages, msg]
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
    return { messages }
  }),
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
