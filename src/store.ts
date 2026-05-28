import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from './services/supabase'

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
  pfp_url: string | null
  status: 'Online' | 'Offline' | 'In-game' | 'Away'
}

export interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  content: string | null
  media_url?: string | null
  media_type?: 'image' | 'video' | 'file' | 'gif' | null
  is_pinned: boolean
  is_edited: boolean
  created_at: string
}

interface FriendsState {
  friends: Friend[]
  pendingRequests: Friend[]
  discoverUsers: Friend[]
  messages: ChatMessage[]
  loading: boolean
  fetchFriends: (userId: string) => Promise<void>
  fetchDiscoverUsers: (userId: string, query?: string) => Promise<void>
  addFriend: (userId: string, friendId: string) => Promise<void>
  acceptFriend: (userId: string, friendId: string) => Promise<void>
  removeFriend: (userId: string, friendId: string) => Promise<void>
  sendMessage: (senderId: string, receiverId: string, content: string, media?: { url: string, type: string }) => Promise<void>
  subscribeToMessages: (userId: string, friendId: string) => () => void
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  pendingRequests: [],
  discoverUsers: [],
  messages: [],
  loading: false,

  fetchFriends: async (userId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        status,
        friend:friend_id(id, username, pfp_url, status),
        user:user_id(id, username, pfp_url, status)
      `)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)

    if (error) {
      console.error('Error fetching friends:', error)
    } else if (data) {
      // Extract accepted friends
      const friendsList = data
        .filter(f => f.status === 'accepted')
        .map(f => {
          if (!f.friend || !f.user) return null
          return f.friend.id === userId ? f.user : f.friend
        })
        .filter(Boolean) as Friend[]
      
      // Extract pending requests where current user is the receiver
      const requestsList = data
        .filter(f => f.status === 'pending' && (f.user as any).id !== userId)
        .map(f => f.user)
        .filter(Boolean) as unknown as Friend[]

      set({ friends: friendsList, pendingRequests: requestsList })
    }
    set({ loading: false })
  },

  fetchDiscoverUsers: async (userId, query = '') => {
    set({ loading: true })
    
    let supabaseQuery = supabase
      .from('profiles')
      .select('id, username, pfp_url, status')
      .neq('id', userId)

    if (query.trim()) {
      supabaseQuery = supabaseQuery.ilike('username', `%${query.trim()}%`)
    } else {
      supabaseQuery = supabaseQuery.limit(20)
    }

    const { data: allProfiles, error: profError } = await supabaseQuery

    if (profError) {
      console.error('Error fetching discover users:', profError)
    } else if (allProfiles) {
      // Also fetch current friendships to exclude those already in some state
      const { data: existingFriendships } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)

      const excludedIds = new Set<string>()
      existingFriendships?.forEach(f => {
        excludedIds.add(f.user_id === userId ? f.friend_id : f.user_id)
      })

      const discoverList = (allProfiles as unknown as Friend[]).filter(p => !excludedIds.has(p.id))
      set({ discoverUsers: discoverList })
    }
    set({ loading: false })
  },

  addFriend: async (userId, friendId) => {
    const { error } = await supabase
      .from('friendships')
      .insert({ user_id: userId, friend_id: friendId, status: 'pending' })
    
    if (error) {
      console.error('Error adding friend:', error.message)
      alert(`Could not add friend: ${error.message}`)
    } else {
      await get().fetchFriends(userId)
      await get().fetchDiscoverUsers(userId)
    }
  },

  acceptFriend: async (userId, friendId) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .match({ user_id: friendId, friend_id: userId })
    
    if (error) {
      console.error('Error accepting friend:', error.message)
    } else {
      await get().fetchFriends(userId)
      await get().fetchDiscoverUsers(userId)
    }
  },

  removeFriend: async (userId, friendId) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
    
    if (error) {
      console.error('Error removing friend:', error.message)
    } else {
      await get().fetchFriends(userId)
      await get().fetchDiscoverUsers(userId)
    }
  },

  sendMessage: async (senderId, receiverId, content, media) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        media_url: media?.url,
        media_type: media?.type
      })
    
    if (error) console.error('Error sending message:', error)
  },

  subscribeToMessages: (userId, friendId) => {
    const channel = supabase
      .channel(`chat:${userId}:${friendId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId}))`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as ChatMessage
          set(state => {
             // Only add if not already in list (initial fetch might clash)
             if (state.messages.some(m => m.id === newMessage.id)) return state
             return { messages: [...state.messages, newMessage] }
          })
        }
      })
      .subscribe()

    // Initial fetch
    supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) set({ messages: data as ChatMessage[] })
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }
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
