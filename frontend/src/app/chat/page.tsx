// app/chat/page.tsx
import { redirect } from 'next/navigation'

export default function ChatPage() {
  redirect('/chat/MyChat')  // ✅ 小写路径
}
