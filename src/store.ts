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
  reactions: Record<string, string[]> // emoji -> array of user_ids
  is_pinned: boolean
  is_edited: boolean
  created_at: string
}

export interface GameComment {
  id: string
  game_id: string
  user_id: string
  content: string
  parent_id?: string | null
  liked_by?: string[]
  disliked_by?: string[]
  created_at: string
  profiles?: {
    username: string
    pfp_url: string | null
  }
}

export interface PlayedGame {
  id: string
  user_id: string
  game_id: string
  game_title: string
  game_cover: string
  created_at: string
}

interface PlayedGamesState {
  playedGames: PlayedGame[]
  loading: boolean
  fetchPlayedGames: (userId: string) => Promise<void>
  togglePlayedGame: (userId: string, game: { id: string | number; title: string; img: string }) => Promise<void>
}

export const usePlayedGamesStore = create<PlayedGamesState>((set, get) => ({
  playedGames: [],
  loading: false,

  fetchPlayedGames: async (userId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('played_games')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching played games:', error)
    } else {
      set({ playedGames: data as PlayedGame[] })
    }
    set({ loading: false })
  },

  togglePlayedGame: async (userId, game) => {
    const gameId = game.id.toString()
    const existing = get().playedGames.find(g => g.game_id === gameId && g.user_id === userId)

    if (existing) {
      // Optimistic remove
      set(state => ({
        playedGames: state.playedGames.filter(g => g.id !== existing.id)
      }))
      const { error } = await supabase
        .from('played_games')
        .delete()
        .eq('id', existing.id)
      
      if (error) {
        console.error('Error removing played game:', error)
        // Revert on error (re-fetch)
        await get().fetchPlayedGames(userId)
      }
    } else {
      // Add new
      const newGame = {
        user_id: userId,
        game_id: gameId,
        game_title: game.title,
        game_cover: game.img
      }
      const { data, error } = await supabase
        .from('played_games')
        .insert(newGame)
        .select()
        .single()

      if (error) {
        console.error('Error adding played game:', error)
      } else if (data) {
        set(state => ({
          playedGames: [data as PlayedGame, ...state.playedGames]
        }))
      }
    }
  }
}))

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
  sendMessage: (senderId: string, receiverId: string, content: string | null, media?: { url: string, type: string }) => Promise<void>
  addReaction: (messageId: string, userId: string, emoji: string) => Promise<void>
  editMessage: (messageId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  togglePinMessage: (messageId: string, isPinned: boolean) => Promise<void>
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
          return (f.friend as any).id === userId ? f.user : f.friend
        })
        .filter(Boolean) as unknown as Friend[]
      
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
    // 1. Add early return for empty queries
    if (!query.trim()) {
      set({ discoverUsers: [], loading: false })
      return
    }

    set({ loading: true })
    
    // 2. Only fetch when there is a query
    const { data: allProfiles, error: profError } = await supabase
      .from('profiles')
      .select('id, username, pfp_url, status')
      .neq('id', userId)
      .ilike('username', `%${query.trim()}%`)
      .limit(10) // Increase limit slightly since we are specifically searching

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
    // Optimistic message for "Fast Response"
    const optimisticId = crypto.randomUUID()
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      media_url: media?.url,
      media_type: media?.type as any,
      reactions: {},
      is_pinned: false,
      is_edited: false,
      created_at: new Date().toISOString()
    }
    
    set(state => ({ messages: [...state.messages, optimisticMessage] }))

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        media_url: media?.url,
        media_type: media?.type,
        reactions: {}
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error sending message:', error)
      // Remove optimistic message on error
      set(state => ({ messages: state.messages.filter(m => m.id !== optimisticId) }))
    } else if (data) {
      // Replace optimistic message with real one
      set(state => ({
        messages: state.messages.map(m => m.id === optimisticId ? data as ChatMessage : m)
      }))
    }
  },

  addReaction: async (messageId, userId, emoji) => {
    const message = get().messages.find(m => m.id === messageId)
    if (!message) return

    const reactions = message.reactions ? { ...message.reactions } : {}
    const users = reactions[emoji] || []
    
    if (users.includes(userId)) {
      reactions[emoji] = users.filter(id => id !== userId)
      if (reactions[emoji].length === 0) delete reactions[emoji]
    } else {
      reactions[emoji] = [...users, userId]
    }

    // Optimistic update
    set(state => ({
      messages: state.messages.map(m => m.id === messageId ? { ...m, reactions } : m)
    }))

    const { error } = await supabase
      .from('messages')
      .update({ reactions })
      .eq('id', messageId)

    if (error) {
      console.error('Error updating reactions:', error)
      // Revert if error
      set(state => ({
        messages: state.messages.map(m => m.id === messageId ? message : m)
      }))
    }
  },

  editMessage: async (messageId, content) => {
    const { error } = await supabase
      .from('messages')
      .update({ content, is_edited: true })
      .eq('id', messageId)
    
    if (error) console.error('Error editing message:', error)
  },

  deleteMessage: async (messageId) => {
    // Optimistic delete
    set(state => ({ messages: state.messages.filter(m => m.id !== messageId) }))

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
    
    if (error) {
      console.error('Error deleting message:', error)
      // We don't easily have the message back to restore it without a re-fetch
      // but the subscription will handle correctness if we are out of sync.
    }
  },

  togglePinMessage: async (messageId, isPinned) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_pinned: isPinned })
      .eq('id', messageId)
    
    if (error) console.error('Error pinning message:', error)
  },

  subscribeToMessages: (userId, friendId) => {
    const channel = supabase
      .channel(`chat:${userId}:${friendId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        // Handle logic in callback since complex filters are not supported in postgres_changes
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as ChatMessage
          // Only process if it belongs to this conversation
          const isFromUs = newMessage.sender_id === userId && newMessage.receiver_id === friendId
          const isToUs = newMessage.sender_id === friendId && newMessage.receiver_id === userId
          
          if (isFromUs || isToUs) {
            set(state => {
               if (state.messages.some(m => m.id === newMessage.id)) return state
               return { messages: [...state.messages, newMessage] }
            })
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedMessage = payload.new as ChatMessage
          set(state => ({
            messages: state.messages.map(m => m.id === updatedMessage.id ? updatedMessage : m)
          }))
        } else if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as any).id
          set(state => ({
            messages: state.messages.filter(m => m.id !== deletedId)
          }))
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

interface GameCommentsState {
  comments: GameComment[]
  loading: boolean
  hasMore: boolean
  fetchComments: (gameId: string, lastCreatedAt?: string) => Promise<void>
  addComment: (gameId: string, userId: string, content: string) => Promise<void>
  likeComment: (commentId: string, userId: string) => Promise<void>
  dislikeComment: (commentId: string, userId: string) => Promise<void>
  editComment: (commentId: string, content: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
  addReply: (gameId: string, parentId: string, userId: string, content: string) => Promise<void>
}

export const useGameCommentsStore = create<GameCommentsState>((set, get) => ({
  comments: [],
  loading: false,
  hasMore: true,
  
  fetchComments: async (gameId, lastCreatedAt) => {
    set({ loading: true })
    let query = supabase
      .from('game_comments')
      .select('*, profiles(username, pfp_url)')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (lastCreatedAt) {
      query = query.lt('created_at', lastCreatedAt)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching comments:', error)
      set({ loading: false })
    } else if (data) {
      const newComments = data as unknown as GameComment[]
      set(state => ({
        comments: lastCreatedAt ? [...state.comments, ...newComments] : newComments,
        hasMore: newComments.length === 50,
        loading: false
      }))
    } else {
      set({ loading: false })
    }
  },

  addComment: async (gameId, userId, content) => {
    const { data, error } = await supabase
      .from('game_comments')
      .insert({ game_id: gameId, user_id: userId, content })
      .select('*, profiles(username, pfp_url)')
      .single()

    if (error) {
      console.error('Error adding comment:', error)
    } else if (data) {
      set(state => ({
        comments: [data as unknown as GameComment, ...state.comments]
      }))
    }
  },

  likeComment: async (commentId, userId) => {
    const comment = get().comments.find(c => c.id === commentId)
    if (!comment) return

    const likedBy = comment.liked_by || []
    const dislikedBy = comment.disliked_by || []

    let newLikedBy = [...likedBy]
    let newDislikedBy = [...dislikedBy]

    if (newLikedBy.includes(userId)) {
      newLikedBy = newLikedBy.filter(id => id !== userId)
    } else {
      newLikedBy.push(userId)
      newDislikedBy = newDislikedBy.filter(id => id !== userId)
    }

    // Optimistic update
    set(state => ({
      comments: state.comments.map(c => c.id === commentId ? { ...c, liked_by: newLikedBy, disliked_by: newDislikedBy } : c)
    }))

    const { error } = await supabase.from('game_comments').update({ liked_by: newLikedBy, disliked_by: newDislikedBy }).eq('id', commentId)
    if (error) {
      console.error('Error liking comment:', error)
    }
  },

  dislikeComment: async (commentId, userId) => {
    const comment = get().comments.find(c => c.id === commentId)
    if (!comment) return

    const likedBy = comment.liked_by || []
    const dislikedBy = comment.disliked_by || []

    let newLikedBy = [...likedBy]
    let newDislikedBy = [...dislikedBy]

    if (newDislikedBy.includes(userId)) {
      newDislikedBy = newDislikedBy.filter(id => id !== userId)
    } else {
      newDislikedBy.push(userId)
      newLikedBy = newLikedBy.filter(id => id !== userId)
    }

    // Optimistic update
    set(state => ({
      comments: state.comments.map(c => c.id === commentId ? { ...c, liked_by: newLikedBy, disliked_by: newDislikedBy } : c)
    }))

    const { error } = await supabase.from('game_comments').update({ liked_by: newLikedBy, disliked_by: newDislikedBy }).eq('id', commentId)
    if (error) {
      console.error('Error disliking comment:', error)
    }
  },

  editComment: async (commentId, content) => {
    set(state => ({
      comments: state.comments.map(c => c.id === commentId ? { ...c, content } : c)
    }))
    const { error } = await supabase.from('game_comments').update({ content }).eq('id', commentId)
    if (error) console.error('Error editing comment:', error)
  },

  deleteComment: async (commentId) => {
    set(state => ({
      comments: state.comments.filter(c => c.id !== commentId && c.parent_id !== commentId)
    }))
    const { error } = await supabase.from('game_comments').delete().eq('id', commentId)
    if (error) console.error('Error deleting comment:', error)
  },

  addReply: async (gameId, parentId, userId, content) => {
    const { data, error } = await supabase
      .from('game_comments')
      .insert({ game_id: gameId, parent_id: parentId, user_id: userId, content })
      .select('*, profiles(username, pfp_url)')
      .single()

    if (error) {
      console.error('Error adding reply:', error)
    } else if (data) {
      set(state => ({
        comments: [...state.comments, data as unknown as GameComment]
      }))
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
  genres?: string
  metacritic?: string
  platforms?: string
  setQuery: (query: string) => void
  setFilters: (filters: { ordering?: string; dates?: string; genres?: string; metacritic?: string; platforms?: string }) => void
  clearFilters: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  ordering: undefined,
  dates: undefined,
  genres: undefined,
  metacritic: undefined,
  platforms: undefined,
  setQuery: (query) => set({ query }),
  setFilters: (filters) => set(filters),
  clearFilters: () => set({ query: '', ordering: undefined, dates: undefined, genres: undefined, metacritic: undefined, platforms: undefined }),
}))
