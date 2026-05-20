import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

const imgProfile = 'https://www.figma.com/api/mcp/asset/87533ed7-1e60-4488-9557-f7f13e2939da'
const imgThumbsUp = 'https://www.figma.com/api/mcp/asset/3dc156e7-5edc-49ac-95a4-da890bda6400'
const imgThumbsDown = 'https://www.figma.com/api/mcp/asset/32f04a81-fa7c-42d9-8954-a823d904cd0a'
const imgMessageComment = 'https://www.figma.com/api/mcp/asset/ecb81871-cd25-4f96-befa-a53eda5c09d4'
const imgLine = 'https://www.figma.com/api/mcp/asset/bed8d55a-88f0-4f90-b40e-91682dd90e42'
const imgChevronRight = 'https://www.figma.com/api/mcp/asset/eae2a37d-9011-4c07-98bb-36f2268216ce'

interface Reply {
  name: string
  role: string
  text: string
  likes: number
  dislikes: number
}

interface Comment {
  name: string
  role: string
  text: string
  likes: number
  dislikes: number
  replies: Reply[]
}

const comments: Comment[] = [
  {
    name: 'Lysandra Bellamy',
    role: 'Gamer and Streamer',
    text: 'This game is amazing! The graphics are top-notch.',
    likes: 24,
    dislikes: 2,
    replies: [
      { name: 'Kaius Orlov', role: 'Game Developer', text: 'I agree! The storyline is really engaging.', likes: 12, dislikes: 0 },
      { name: 'Seraphina Voss', role: 'Game Enthusiast', text: "Can't wait for the next update!", likes: 8, dislikes: 1 },
      { name: 'Thorne Adler', role: 'Competitive Gamer', text: 'The multiplayer mode is so much fun!', likes: 5, dislikes: 0 },
    ],
  },
  {
    name: 'Riven Kade',
    role: 'Casual Gamer',
    text: 'The controls are a bit clunky, but overall a great game.',
    likes: 18,
    dislikes: 3,
    replies: [
      { name: 'Zephyr Lark', role: 'Game Reviewer', text: 'I found them okay after getting used to it.', likes: 9, dislikes: 0 },
      { name: 'Aria Winslow', role: 'Tech Blogger', text: "Maybe they'll improve it in the next patch.", likes: 3, dislikes: 0 },
      { name: 'Madden Faye', role: 'Gamer', text: 'I hope so too!', likes: 2, dislikes: 1 },
    ],
  },
]

function Reactions({ likes, dislikes }: { likes: number; dislikes: number }) {
  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2 w-[72px]">
        <img src={imgThumbsUp} alt="like" className="w-6 h-6" />
        <span className="font-shantell font-medium text-[15px] text-black/80">{likes}</span>
      </div>
      <div className="flex items-center gap-2 w-[72px]">
        <img src={imgThumbsDown} alt="dislike" className="w-6 h-6" />
        <span className="font-shantell font-medium text-[15px] text-black/80">{dislikes}</span>
      </div>
      <img src={imgMessageComment} alt="reply" className="w-6 h-6" />
    </div>
  )
}

function UserHeading({ name, role, size = 36 }: { name: string; role: string; size?: number }) {
  return (
    <div className="flex items-center gap-3 bg-[#9d9d9d]">
      <img src={imgProfile} alt={name} className="shrink-0" style={{ width: size, height: size }} />
      <div className="flex flex-col font-flow text-[13px] whitespace-nowrap overflow-hidden">
        <span className="text-black/80 leading-4 overflow-hidden text-ellipsis">{name}</span>
        <span className="text-black/40 leading-4 overflow-hidden text-ellipsis">{role}</span>
      </div>
    </div>
  )
}

function CommentThread({ comment }: { comment: Comment }) {
  return (
    <div className="flex flex-col bg-[#9d9d9d]">
      {/* Main comment */}
      <div className="flex flex-col gap-3 py-4 w-[636px] bg-[#9d9d9d]">
        <UserHeading name={comment.name} role={comment.role} />
        <p className="font-flow text-[15px] text-black/40 leading-5">{comment.text}</p>
        <Reactions likes={comment.likes} dislikes={comment.dislikes} />
      </div>

      {/* Replies */}
      <div className="flex flex-col bg-[#9d9d9d]">
        {comment.replies.map((reply, i) => (
          <div key={i} className="flex gap-4 pl-8 py-2 bg-[#9d9d9d] w-[636px]">
            {/* Vertical line */}
            <div className="relative self-stretch w-0 shrink-0">
              <div className="absolute inset-y-0 -inset-x-px">
                <img src={imgLine} alt="" className="w-full h-full" />
              </div>
            </div>
            {/* Reply content */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              <UserHeading name={reply.name} role={reply.role} size={36} />
              <p className="font-flow text-[15px] text-black/40 leading-5">{reply.text}</p>
              <Reactions likes={reply.likes} dislikes={reply.dislikes} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GameDetailPage() {
  return (
    <div className="bg-[#9d9d9d] min-w-[1440px]">
      <Header />

      {/* Article content placeholder */}
      <div className="mx-auto px-[67px] pt-6 pb-0" style={{ maxWidth: 1440 }}>
        <div className="h-[80px] bg-[#9d9d9d]" />
      </div>

      {/* ── Comment Section ── */}
      <section className="mx-auto bg-[#9d9d9d] px-[67px] py-6" style={{ maxWidth: 1440 }}>
        {/* Top divider */}
        <div className="border-t border-black/20 mb-6" />

        <div className="flex flex-col items-start">
          {/* Comments heading */}
          <h2 className="font-shantell font-medium text-xl text-black/80 leading-6 w-[636px] mb-0">
            Comments
          </h2>

          {/* Comment input */}
          <div className="flex items-start gap-3 py-4 bg-[#9d9d9d] w-full">
            <img src={imgProfile} alt="Your avatar" className="w-9 h-9 shrink-0 mt-1" />
            <div className="flex-1 bg-[#9d9d9d] border-2 border-black/80 rounded min-h-[76px] px-3 py-2">
              <p className="font-flow text-[15px] text-black/20 leading-5">Add a comment...</p>
            </div>
          </div>

          {/* Comment threads */}
          <div className="flex flex-col bg-[#9d9d9d]">
            {comments.map((comment, i) => (
              <CommentThread key={i} comment={comment} />
            ))}
          </div>

          {/* Footer: pagination */}
          <div className="flex items-center justify-between py-4 w-full bg-[#9d9d9d]">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`w-9 h-9 rounded flex items-center justify-center font-shantell font-medium text-[15px] text-center ${
                    n === 1 ? 'bg-black/80 text-[#9d9d9d]' : 'text-black/40'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button className="w-9 h-9 rounded bg-[#9d9d9d] flex items-center justify-center">
                <img src={imgChevronRight} alt="Next" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Divider + Footer */}
      <div className="border-t border-black/20" />
      <Footer />
    </div>
  )
}
