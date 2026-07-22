/**
 * LRS Smart Features   Three interconnected modules:
 * 1. SmartPopup     pre-lecture notification pop-up (bottom-right)
 * 2. CourseChat     per-course chat space (Lecturer <-> REP)
 * 3. LRSAssistant   AI study assistant for students (LRS Assistant)
 *
 * All state is in-memory. Real backend would replace useState with
 * WebSocket connections and API calls at the marked integration points.
 */

import { useState, useRef, useEffect, type ReactNode } from "react";
import {
  Bell, X, MessageSquare, Bot, Send, Paperclip, Phone,
  ChevronDown, ChevronUp, Sparkles, BookOpen, User, Users,
  AlertTriangle, CheckCircle, Clock, Loader2, Mic, FileText,
  Minimize2, Maximize2, RefreshCw, ArrowRight, GraduationCap,
  Hash, Pin, Download, MoreHorizontal
} from "lucide-react";

// --- Types --------------------------------------------------------------------

export type UserRole = "student" | "lecturer" | "rep" | "assistant_rep";

export interface ChatUser {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  type: "text" | "announcement" | "file" | "ai";
  fileName?: string;
  pinned?: boolean;
  reactions?: Record<string, string[]>; // emoji -> userIds
}

export interface CourseRoom {
  courseCode: string;
  courseTitle: string;
  level: number;
  messages: ChatMessage[];
  participants: ChatUser[];
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface PopupNotification {
  id: string;
  courseCode: string;
  courseTitle: string;
  minutesBefore: number;
  venue: string;
  lecturer: string;
  day: string;
  time: string;
  dismissed: boolean;
}

// --- Seed chat data -----------------------------------------------------------

const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  CSC301: [
    { id:"m1", senderId:"LEC/001", senderName:"Dr. Emeka Okafor", senderRole:"lecturer", content:"Good morning everyone! Today we'll be covering Software Architecture patterns. Please review chapter 4 before class.", timestamp:"08:15", type:"announcement", pinned:true },
    { id:"m2", senderId:"REP001",  senderName:"Aisha Mohammed (REP)", senderRole:"rep", content:"Noted sir! I've shared the chapter link in the group. Will the quiz still hold today?", timestamp:"08:22", type:"text" },
    { id:"m3", senderId:"LEC/001", senderName:"Dr. Emeka Okafor", senderRole:"lecturer", content:"Yes, the quiz holds at the end of the lecture. It will cover chapters 3 and 4.", timestamp:"08:25", type:"text" },
    { id:"m4", senderId:"AREP001", senderName:"Ibrahim (Asst. REP)", senderRole:"assistant_rep", content:"I've noted the attendance so far. 42 students have confirmed they're coming.", timestamp:"08:30", type:"text" },
  ],
  CSC401: [
    { id:"m5", senderId:"LEC/001", senderName:"Dr. Emeka Okafor", senderRole:"lecturer", content:"Distributed Systems lecture will start at 10:00. We're in LT-C today.", timestamp:"09:45", type:"announcement", pinned:true },
    { id:"m6", senderId:"REP002",  senderName:"Fatima Bello (REP)", senderRole:"rep", content:"Thank you Dr. Okafor. I'll inform the class.", timestamp:"09:47", type:"text" },
  ],
  MTH201: [
    { id:"m7", senderId:"LEC/002", senderName:"Prof. Amina Yusuf", senderRole:"lecturer", content:"Calculus II   please bring your textbooks today. We'll be doing in-class exercises.", timestamp:"07:30", type:"announcement", pinned:true },
  ],
};

const SEED_ROOMS: CourseRoom[] = [
  {
    courseCode:"CSC301", courseTitle:"Software Engineering", level:300,
    messages: SEED_MESSAGES.CSC301,
    participants:[
      {id:"LEC/001",name:"Dr. Emeka Okafor",role:"lecturer"},
      {id:"REP001", name:"Aisha Mohammed",  role:"rep"},
      {id:"AREP001",name:"Ibrahim Suleiman",role:"assistant_rep"},
    ]
  },
  {
    courseCode:"CSC401", courseTitle:"Distributed Systems", level:400,
    messages: SEED_MESSAGES.CSC401,
    participants:[
      {id:"LEC/001",name:"Dr. Emeka Okafor",role:"lecturer"},
      {id:"REP002", name:"Fatima Bello",    role:"rep"},
    ]
  },
  {
    courseCode:"MTH201", courseTitle:"Calculus II", level:200,
    messages: SEED_MESSAGES.MTH201,
    participants:[
      {id:"LEC/002",name:"Prof. Amina Yusuf",role:"lecturer"},
      {id:"REP003", name:"Emmanuel Adeyemi",role:"rep"},
    ]
  },
];

const SEED_POPUPS: PopupNotification[] = [
  { id:"pop1", courseCode:"CSC301", courseTitle:"Software Engineering", minutesBefore:15, venue:"LT-B", lecturer:"Dr. Emeka Okafor", day:"Monday", time:"14:00", dismissed:false },
  { id:"pop2", courseCode:"PHY101", courseTitle:"General Physics I",    minutesBefore:30, venue:"SCI-LT", lecturer:"Prof. Obinna Nwachukwu", day:"Monday", time:"10:00", dismissed:false },
];

// --- Shared small helpers -----------------------------------------------------

const roleColors: Record<UserRole, string> = {
  lecturer:      "bg-blue-100 text-blue-800 border-blue-200",
  rep:           "bg-emerald-100 text-emerald-800 border-emerald-200",
  assistant_rep: "bg-violet-100 text-violet-800 border-violet-200",
  student:       "bg-slate-100 text-slate-700 border-slate-200",
};
const roleLabel: Record<UserRole, string> = {
  lecturer:"Lecturer", rep:"Class REP", assistant_rep:"Asst. REP", student:"Student"
};
const roleBubble: Record<UserRole, string> = {
  lecturer:      "bg-blue-600 text-white",
  rep:           "bg-emerald-600 text-white",
  assistant_rep: "bg-violet-600 text-white",
  student:       "bg-primary text-white",
};

function Avatar({ name, role, size="sm" }: { name:string; role:UserRole; size?:"sm"|"md"|"lg" }) {
  const initials = name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  const sz = size==="lg"?"w-10 h-10 text-base":size==="md"?"w-8 h-8 text-sm":"w-7 h-7 text-xs";
  return (
    <div className={`${sz} rounded-full ${roleBubble[role]} flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function TimeBadge({ t }: { t:string }) {
  return <span className="text-xs text-muted-foreground font-mono flex-shrink-0">{t}</span>;
}

function RolePill({ role }: { role:UserRole }) {
  return <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${roleColors[role]}`}>{roleLabel[role]}</span>;
}

type MutedForeground = "text-muted-foreground";

// Reusable panel wrapper
function Panel({ title, onClose, children, width="w-96", extra }:{
  title:ReactNode; onClose:()=>void; children:ReactNode; width?:string; extra?:ReactNode;
}) {
  return (
    <div className={`${width} bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden`} style={{maxHeight:"520px"}}>
      <div className="flex items-center justify-between px-4 py-3 bg-primary border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2 text-white">{title}</div>
        <div className="flex items-center gap-1">
          {extra}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors"><X className="w-4 h-4 text-white/70"/></button>
        </div>
      </div>
      {children}
    </div>
  );
}

// ==============================================================================
// FEATURE 1   SMART POPUP NOTIFICATION
// ==============================================================================

interface SmartPopupProps {
  notifications: PopupNotification[];
  userRole: UserRole;
  onDismiss: (id:string) => void;
  onOpenChat: (courseCode:string) => void;
  onOpenAI: () => void;
}

export function SmartPopup({ notifications, userRole, onDismiss, onOpenChat, onOpenAI }: SmartPopupProps) {
  const active = notifications.filter(n=>!n.dismissed);
  const [expanded, setExpanded] = useState(true);

  if(active.length===0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end">
      {/* Stack indicator when collapsed */}
      {!expanded && active.length > 1 && (
        <div className="flex flex-col gap-1 items-end mb-1">
          {active.slice(1).map((_,i)=>(
            <div key={i} className={`bg-white border border-border rounded-xl shadow-md opacity-${i===0?60:30} h-2`}
              style={{width:`${352-(i+1)*12}px`,marginRight:`${(i+1)*6}px`}}/>
          ))}
        </div>
      )}

      {/* Top notification */}
      <div className="w-88 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden" style={{width:"352px"}}>
        {/* Header */}
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"/>
            <span className="text-white text-sm font-semibold">Upcoming Lecture</span>
            {active.length > 1 && (
              <span className="bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{active.length}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={()=>setExpanded(e=>!e)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              {expanded ? <ChevronDown className="w-4 h-4 text-white/70"/> : <ChevronUp className="w-4 h-4 text-white/70"/>}
            </button>
            <button onClick={()=>onDismiss(active[0].id)} className="p-1 rounded-lg hover:bg-white/10 transition-colors"><X className="w-4 h-4 text-white/70"/></button>
          </div>
        </div>

        {expanded && (
          <div className="p-4">
            {/* Lecture info */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600"/>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-foreground">{active[0].courseCode}</span>
                  <span className="text-sm text-foreground">{active[0].courseTitle}</span>
                </div>
                <div className="text-xs text-muted-foreground">{active[0].time} · {active[0].venue} · {active[0].lecturer}</div>
                <div className="mt-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${active[0].minutesBefore<=15?"bg-red-50 text-red-700 border border-red-200":"bg-amber-50 text-amber-700 border border-amber-200"}`}>
                    {active[0].minutesBefore <= 15 ? `Starts in ${active[0].minutesBefore} min` : `In ${active[0].minutesBefore} min`}
                  </span>
                </div>
              </div>
            </div>

            {/* Role-based action buttons */}
            {(userRole === "lecturer") && (
              <div className="flex flex-col gap-2">
                <button onClick={()=>onOpenChat(active[0].courseCode)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                  <MessageSquare className="w-4 h-4"/>Communicate with REP
                </button>
                <button onClick={()=>onDismiss(active[0].id)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors">
                  <CheckCircle className="w-4 h-4"/>I'm Coming
                </button>
              </div>
            )}

            {(userRole === "rep" || userRole === "assistant_rep") && (
              <div className="flex flex-col gap-2">
                <button onClick={()=>onOpenChat(active[0].courseCode)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors">
                  <MessageSquare className="w-4 h-4"/>Open Course Chat
                </button>
                <button onClick={()=>onDismiss(active[0].id)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors border border-border">
                  <CheckCircle className="w-4 h-4 text-emerald-600"/>Confirmed   Attending
                </button>
              </div>
            )}

            {userRole === "student" && (
              <div className="flex flex-col gap-2">
                <button onClick={onOpenAI}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                  <Sparkles className="w-4 h-4"/>Open LRS Assistant
                </button>
                <button onClick={()=>onDismiss(active[0].id)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors border border-border">
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==============================================================================
// FEATURE 2   COURSE CHAT SPACE
// ==============================================================================

interface CourseChatProps {
  room: CourseRoom;
  currentUser: ChatUser;
  onClose: () => void;
  onOpenAI?: () => void;
  inline?: boolean;
  onUpdateMessages?: (roomCode: string, messages: ChatMessage[]) => void;
}

export function CourseChat({ room, currentUser, onClose, onOpenAI, inline, onUpdateMessages }: CourseChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(room.messages);
  const [input, setInput] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages(room.messages);
  }, [room.messages, room.courseCode]);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  const canSendAnnouncement = currentUser.role === "lecturer";
  const canWrite = currentUser.role !== "student";

  const send = () => {
    if(!input.trim()) return;
    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),
      type: isAnnouncement ? "announcement" : "text",
    };
    const updated = [...messages, msg];
    setMessages(updated);
    setInput("");
    setIsAnnouncement(false);
    if (onUpdateMessages) onUpdateMessages(room.courseCode, updated);
  };

  const sendFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content: `Shared a file: ${file.name}`,
      timestamp: new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),
      type: "file",
      fileName: file.name,
    };
    const updated = [...messages, msg];
    setMessages(updated);
    if (onUpdateMessages) onUpdateMessages(room.courseCode, updated);
  };

  const togglePin = (id:string) => {
    const updated = messages.map(m=>m.id===id?{...m,pinned:!m.pinned}:m);
    setMessages(updated);
    if (onUpdateMessages) onUpdateMessages(room.courseCode, updated);
  };

  const pinnedMessages = messages.filter(m=>m.pinned);

  if (inline) {
    return (
      <div className="flex-1 flex flex-col h-full bg-card min-w-0">
        {/* Header */}
        <div className="px-5 py-4 bg-primary text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Hash className="w-5 h-5 text-white/80"/>
            <div>
              <div className="font-bold text-sm leading-none flex items-center gap-2">
                {room.courseCode}
                {currentUser.role !== "student" && (
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-semibold">
                    {currentUser.role === "lecturer" ? "Lecturer" : currentUser.role === "rep" ? "REP" : "Asst. REP"}
                  </span>
                )}
              </div>
              <div className="text-xs text-white/60 mt-0.5 font-medium">{room.courseTitle}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pinnedMessages.length > 0 && (
              <button onClick={() => setShowPinned(s => !s)} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors font-medium ${showPinned ? "bg-white/25 text-amber-300" : "bg-white/10 text-white/85 hover:bg-white/15"}`}>
                <Pin className="w-3.5 h-3.5"/>
                <span>{pinnedMessages.length} Pinned</span>
              </button>
            )}
            {onOpenAI && (currentUser.role === "rep" || currentUser.role === "assistant_rep") && (
              <button onClick={onOpenAI} className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/15 text-violet-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium">
                <Sparkles className="w-3.5 h-3.5"/>AI Assistant
              </button>
            )}
          </div>
        </div>

        {/* Participants bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-muted/30 border-b border-border flex-shrink-0 overflow-x-auto">
          <Users className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0"/>
          <span className="text-xs text-muted-foreground flex-shrink-0">{room.participants.length} participants:</span>
          {room.participants.map(p => (
            <span key={p.id} className={`text-xs px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${roleColors[p.role]}`}>{p.name.split(" ")[0]}</span>
          ))}
        </div>

        {/* Pinned messages panel */}
        {showPinned && pinnedMessages.length > 0 && (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 mb-1.5"><Pin className="w-4 h-4 text-amber-600"/><span className="text-xs font-semibold text-amber-700">Pinned Messages</span></div>
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
              {pinnedMessages.map(m => (
                <div key={m.id} className="text-xs text-amber-800 py-1.5 border-t border-amber-100 first:border-0 flex items-start gap-1">
                  <span className="font-semibold flex-shrink-0">{m.senderName.split(" ")[0]}:</span>
                  <span className="break-all">{m.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.senderId === currentUser.id ? "flex-row-reverse" : ""}`}>
              <Avatar name={msg.senderName} role={msg.senderRole}/>
              <div className={`flex flex-col gap-1 max-w-[80%] ${msg.senderId === currentUser.id ? "items-end" : ""}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">{msg.senderName}</span>
                  <RolePill role={msg.senderRole}/>
                  <TimeBadge t={msg.timestamp}/>
                </div>
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.type === "announcement"
                    ? "bg-blue-50 border-l-4 border-blue-500 text-blue-900 rounded-l-none w-full shadow-sm"
                    : msg.type === "file"
                    ? "bg-muted border border-border text-foreground rounded-2xl"
                    : msg.senderId === currentUser.id
                    ? `${roleBubble[currentUser.role]} rounded-br-sm`
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}>
                  {msg.type === "announcement" && <div className="text-xs font-bold text-blue-600 mb-0.5 flex items-center gap-1"><Bell className="w-3.5 h-3.5"/>ANNOUNCEMENT</div>}
                  {msg.type === "file" && <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground"/><span className="break-all">{msg.content}</span><button className="text-primary hover:underline text-xs"><Download className="w-3.5 h-3.5"/></button></div>}
                  {msg.type !== "file" && <span className="whitespace-pre-wrap break-words">{msg.content}</span>}
                </div>
                {currentUser.role === "lecturer" && (
                  <button onClick={() => togglePin(msg.id)} className={`text-xs flex items-center gap-1 mt-0.5 transition-colors ${msg.pinned ? "text-amber-600 font-medium" : "text-muted-foreground hover:text-amber-600"}`}>
                    <Pin className="w-3 h-3"/>{msg.pinned ? "Pinned" : "Pin"}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>

        {/* View only notice */}
        {!canWrite && (
          <div className="px-5 py-3 bg-amber-50 border-t border-border flex items-start gap-2.5 flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-xs font-semibold text-amber-800">Read-only Access</p>
              <p className="text-xs text-amber-700 mt-0.5">This chat channel is read-only for students. Only Lecturers and Class REPs can send messages.</p>
            </div>
          </div>
        )}

        {/* Input area */}
        {canWrite && (
          <div className="px-5 py-4 border-t border-border bg-card flex-shrink-0">
            {isAnnouncement && (
              <div className="flex items-center gap-2 mb-2.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl">
                <Bell className="w-3.5 h-3.5 flex-shrink-0"/>
                <span>Sending as Announcement — will notify all course students.</span>
                <button onClick={() => setIsAnnouncement(false)} className="ml-auto text-blue-500 hover:text-blue-700"><X className="w-3.5 h-3.5"/></button>
              </div>
            )}
            <div className="flex items-end gap-3">
              <div className="flex-1 bg-input-background border border-border rounded-2xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={canSendAnnouncement ? "Send message or announcement... (Enter to send)" : "Message class... (Enter to send)"}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
                  rows={2}
                />
                <div className="flex items-center gap-2 mt-2">
                  <input ref={fileInputRef} type="file" className="sr-only" onChange={sendFile}/>
                  <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Attach file"><Paperclip className="w-4 h-4"/></button>
                  {canSendAnnouncement && (
                    <button onClick={() => setIsAnnouncement(a => !a)} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors font-medium ${isAnnouncement ? "bg-blue-100 text-blue-700" : "hover:bg-muted text-muted-foreground"}`}><Bell className="w-3.5 h-3.5"/>Announce</button>
                  )}
                </div>
              </div>
              <button onClick={send} disabled={!input.trim()} className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary/95 transition-colors disabled:opacity-45 flex-shrink-0 shadow-md">
                <Send className="w-5 h-5"/>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Panel
      title={<><Hash className="w-4 h-4"/><span className="font-semibold text-sm">{room.courseCode}</span><span className="text-white/60 text-xs ml-1">{room.courseTitle}</span></>}
      onClose={onClose}
      width="w-96"
      extra={
        <div className="flex items-center gap-1">
          {pinnedMessages.length>0 && (
            <button onClick={()=>setShowPinned(s=>!s)} className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
              <Pin className="w-3.5 h-3.5"/>{pinnedMessages.length}
            </button>
          )}
          {onOpenAI && (currentUser.role==="rep"||currentUser.role==="assistant_rep") && (
            <button onClick={onOpenAI} className="flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
              <Sparkles className="w-3.5 h-3.5"/>AI
            </button>
          )}
          <button onClick={()=>setMinimized(m=>!m)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            {minimized?<Maximize2 className="w-4 h-4 text-white/70"/>:<Minimize2 className="w-4 h-4 text-white/70"/>}
          </button>
        </div>
      }
    >
      {!minimized && (
        <>
          {/* Participants bar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border flex-shrink-0">
            <Users className="w-3.5 h-3.5 text-muted-foreground"/>
            <span className="text-xs text-muted-foreground">{room.participants.length} participants:</span>
            {room.participants.map(p=>(
              <span key={p.id} className={`text-xs px-1.5 py-0.5 rounded border ${roleColors[p.role]}`}>{p.name.split(" ")[0]}</span>
            ))}
          </div>

          {/* Pinned messages panel */}
          {showPinned && pinnedMessages.length>0 && (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 flex-shrink-0">
              <div className="flex items-center gap-1 mb-1.5"><Pin className="w-3.5 h-3.5 text-amber-600"/><span className="text-xs font-semibold text-amber-700">Pinned Messages</span></div>
              {pinnedMessages.map(m=>(
                <div key={m.id} className="text-xs text-amber-800 py-1 border-t border-amber-200 first:border-0">
                  <span className="font-semibold">{m.senderName.split(" ")[0]}:</span> {m.content}
                </div>
              ))}
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3" style={{minHeight:"220px"}}>
            {messages.map(msg=>(
              <div key={msg.id} className={`flex gap-2.5 ${msg.senderId===currentUser.id?"flex-row-reverse":""}`}>
                <Avatar name={msg.senderName} role={msg.senderRole}/>
                <div className={`flex flex-col gap-0.5 max-w-[75%] ${msg.senderId===currentUser.id?"items-end":""}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">{msg.senderName}</span>
                    <RolePill role={msg.senderRole}/>
                    <TimeBadge t={msg.timestamp}/>
                  </div>
                  <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.type==="announcement"
                      ? "bg-blue-50 border-l-4 border-blue-500 text-blue-900 rounded-l-none w-full"
                      : msg.type==="file"
                      ? "bg-muted border border-border text-foreground"
                      : msg.senderId===currentUser.id
                      ? `${roleBubble[currentUser.role]} rounded-br-sm`
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}>
                    {msg.type==="announcement"&&<div className="text-xs font-bold text-blue-600 mb-0.5 flex items-center gap-1"><Bell className="w-3 h-3"/>ANNOUNCEMENT</div>}
                    {msg.type==="file"&&<div className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground"/><span>{msg.content}</span><button className="text-primary hover:underline text-xs"><Download className="w-3.5 h-3.5"/></button></div>}
                    {msg.type!=="file"&&<span>{msg.content}</span>}
                  </div>
                  {/* Pin button (lecturer only) */}
                  {currentUser.role==="lecturer"&&(
                    <button onClick={()=>togglePin(msg.id)} className={`text-xs flex items-center gap-1 mt-0.5 transition-colors ${msg.pinned?"text-amber-600":"text-muted-foreground hover:text-amber-600"}`}>
                      <Pin className="w-3 h-3"/>{msg.pinned?"Pinned":"Pin"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>

          {/* Access control notice -  students are read-only, this chat is Lecturer <-> REP only */}
          {!canWrite && (
            <div className="px-4 py-3 bg-amber-50 border-t border-amber-200 flex items-start gap-2.5 flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="text-xs font-semibold text-amber-800">View only</p>
                <p className="text-xs text-amber-700 mt-0.5">This chat is exclusively for the Lecturer and Class REP. Only they can send messages.</p>
              </div>
            </div>
          )}

          {/* Input area */}
          {canWrite && (
            <div className="px-4 py-3 border-t border-border flex-shrink-0">
              {isAnnouncement && (
                <div className="flex items-center gap-2 mb-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
                  <Bell className="w-3.5 h-3.5"/>Sending as Announcement   visible to all students
                  <button onClick={()=>setIsAnnouncement(false)} className="ml-auto text-blue-500 hover:text-blue-700"><X className="w-3.5 h-3.5"/></button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-input-background border border-border rounded-xl px-3 py-2">
                  <textarea
                    value={input}
                    onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
                    placeholder={canSendAnnouncement?"Message or announcement...":"Message class..."}
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
                    rows={1}
                  />
                  <div className="flex items-center gap-1 mt-1">
                    <input ref={fileInputRef} type="file" className="sr-only" onChange={sendFile}/>
                    <button onClick={()=>fileInputRef.current?.click()} className="p-1 rounded-lg hover:bg-muted transition-colors" title="Attach file"><Paperclip className="w-3.5 h-3.5 text-muted-foreground"/></button>
                    {canSendAnnouncement && (
                      <button onClick={()=>setIsAnnouncement(a=>!a)} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg transition-colors ${isAnnouncement?"bg-blue-100 text-blue-700":"hover:bg-muted text-muted-foreground"}`}><Bell className="w-3 h-3"/>Announce</button>
                    )}
                  </div>
                </div>
                <button onClick={send} disabled={!input.trim()} className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 flex-shrink-0">
                  <Send className="w-4 h-4"/>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Panel>
  );
}

// ==============================================================================
// FEATURE 3   LRS ASSISTANT (AI Study Assistant)
// ==============================================================================

// API key is loaded from environment variables for security.
const LRS_AI_API_KEY = import.meta.env.VITE_LRS_AI_API_KEY || "";
const LRS_AI_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const LRS_AI_MODEL    = "deepseek/deepseek-chat";

const QUICK_PROMPTS = [
  "Summarise today's topic for me",
  "Generate 5 practice questions",
  "Explain this concept simply",
  "Create a study plan for my exams",
  "What are the key formulas I need?",
  "Help me understand the assignment",
];

// Shared AI call   used by both floating and inline variants
async function callLRSAssistant(
  userMessage: string,
  history: AIMessage[],
  systemPrompt: string
): Promise<string> {
  const response = await fetch(LRS_AI_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${LRS_AI_API_KEY}`,
      "HTTP-Referer": "https://lrs.uni.edu.ng",
      "X-Title": "LRS Assistant",
    },
    body: JSON.stringify({
      model: LRS_AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || `Request failed (${response.status})`);
  }

  const data = await response.json();
  return (data as any).choices?.[0]?.message?.content ?? "No response received.";
}

// Shared markdown renderer
function renderMD(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={j}>{p.slice(2, -2)}</strong>;
      if (p.match(/^[-\-] /)) return <span key={j} className="block ml-4 before:content-['-'] before:mr-2 before:text-violet-500">{p.slice(2)}</span>;
      return <span key={j}>{p}</span>;
    });
    return <span key={i} className="block">{rendered}</span>;
  });
}

// -- Floating panel variant (used in chat sidebar / launcher) -----------------

interface AIAssistantProps {
  studentName: string;
  studentLevel: string;
  enrolledCourses: string[];
  onClose: () => void;
}

export function AIAssistant({ studentName, studentLevel, enrolledCourses, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([{
    id: "ai0", role: "assistant",
    content: `Hi ${studentName.split(" ")[0]}!  I'm **LRS Assistant**.\n\nI know you're in **${studentLevel}L** and enrolled in: **${enrolledCourses.join(", ")}**.\n\nI can help you with:\n- Explaining lecture topics\n- Generating practice questions\n- Creating study summaries\n- Assignment guidance\n- Study planning\n\nWhat would you like help with?`,
    timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(enrolledCourses[0] ?? "");
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const systemPrompt = `You are LRS Assistant, the official AI study assistant for a Nigerian university Lecture Reminder System.
Student: ${studentName}, Level: ${studentLevel}L. Enrolled: ${enrolledCourses.join(", ")}.
Discussing: ${selectedCourse || "general topics"}.
Be concise, clear, encouraging. Use Nigerian academic context. Format with markdown.
Never complete full assignments   guide and explain instead.`;

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: AIMessage = { id: `u${Date.now()}`, role: "user", content, timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    const tid = `t${Date.now()}`;
    setMessages(prev => [...prev, { id: tid, role: "assistant", content: "", timestamp: "", isStreaming: true }]);
    try {
      const reply = await callLRSAssistant(content, messages, systemPrompt);
      setMessages(prev => prev.map(m => m.id === tid ? { ...m, content: reply, timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), isStreaming: false } : m));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setMessages(prev => prev.map(m => m.id === tid ? { ...m, content: ` ${msg}`, timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), isStreaming: false } : m));
    } finally { setLoading(false); }
  };

  return (
    <Panel
      title={<><Sparkles className="w-4 h-4 text-violet-300"/><span className="font-semibold text-sm">LRS Assistant</span></>}
      onClose={onClose}
      width="w-[400px]"
      extra={<button onClick={() => setMinimized(m => !m)} className="p-1 rounded-lg hover:bg-white/10">{minimized ? <Maximize2 className="w-4 h-4 text-white/70"/> : <Minimize2 className="w-4 h-4 text-white/70"/>}</button>}
    >
      {!minimized && (
        <>
          <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 border-b border-violet-100 flex-shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-violet-500 flex-shrink-0"/>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="flex-1 text-xs bg-transparent text-violet-700 font-medium focus:outline-none border-0">
              {enrolledCourses.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="">General</option>
            </select>
            <span className="text-xs text-violet-400">{studentLevel}L</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3" style={{ minHeight: "200px" }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant"
                  ? <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0"><Sparkles className="w-3.5 h-3.5 text-white"/></div>
                  : <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><User className="w-3.5 h-3.5 text-white"/></div>
                }
                <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : ""}`}>
                  {msg.isStreaming
                    ? <div className="bg-violet-50 border border-violet-100 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2"><Loader2 className="w-4 h-4 text-violet-500 animate-spin"/><span className="text-sm text-violet-600">Thinking...</span></div>
                    : <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === "assistant" ? "bg-violet-50 border border-violet-100 text-foreground rounded-bl-sm" : "bg-primary text-white rounded-br-sm"}`}>{msg.role === "assistant" ? renderMD(msg.content) : msg.content}</div>
                  }
                  {msg.timestamp && <TimeBadge t={msg.timestamp}/>}
                </div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>
          <div className="px-4 py-2 border-t border-border flex-shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {QUICK_PROMPTS.map(p => <button key={p} onClick={() => send(p)} disabled={loading} className="flex-shrink-0 text-xs bg-muted hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 border border-border text-muted-foreground px-2.5 py-1 rounded-full transition-colors disabled:opacity-40">{p}</button>)}
            </div>
          </div>
          <div className="px-4 py-3 border-t border-border flex-shrink-0">
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-input-background border border-border rounded-xl px-3 py-2">
                <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask LRS Assistant..." className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none" rows={1} disabled={loading}/>
              </div>
              <button onClick={() => send()} disabled={!input.trim() || loading} className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 flex-shrink-0">{loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}</button>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}

// ==============================================================================
// FEATURE ORCHESTRATOR   SmartFeaturesHub
// ==============================================================================

export interface SmartFeaturesHubProps {
  userRole: UserRole;
  userId: string;
  userName: string;
  userLevel?: string;
  enrolledCourses: string[];
  onOpenAI?: () => void;
  onOpenChat?: (courseCode: string) => void;
  hideFloatingLauncher?: boolean;
}

export function SmartFeaturesHub({
  userRole,
  userId,
  userName,
  userLevel = "300",
  enrolledCourses,
  onOpenAI,
  onOpenChat,
  hideFloatingLauncher = false
}: SmartFeaturesHubProps) {
  const [popups, setPopups] = useState<PopupNotification[]>(
    // Always start with all popups undismissed on mount
    SEED_POPUPS.map(p => ({ ...p, dismissed: false }))
  );
  const [rooms] = useState<CourseRoom[]>(SEED_ROOMS);
  const [openChatCode, setOpenChatCode] = useState<string|null>(null);
  const [showAI, setShowAI] = useState(false);
  const [showLauncher, setShowLauncher] = useState(false);

  const dismissPopup = (id: string) => setPopups(prev => prev.map(p => p.id === id ? { ...p, dismissed: true } : p));
  const openChat = (code: string) => {
    if (onOpenChat) {
      onOpenChat(code);
    } else {
      setOpenChatCode(code);
      setShowLauncher(false);
    }
  };
  const handleOpenAI = onOpenAI ?? (() => { setShowAI(true); setShowLauncher(false); });

  const currentUser: ChatUser = { id: userId, name: userName, role: userRole };
  const openRoom = rooms.find(r => r.courseCode === openChatCode);
  const accessibleRooms = rooms.filter(r =>
    userRole === "lecturer" ? r.participants.some(p => p.role === "lecturer") :
    userRole === "rep" || userRole === "assistant_rep" ? r.participants.some(p => p.id === userId) :
    enrolledCourses.includes(r.courseCode)
  );

  return (
    <>
      {/* Pop-up for students and lecturers only   not admin */}
      {(userRole === "student" || userRole === "lecturer" || userRole === "rep" || userRole === "assistant_rep") && (
        <SmartPopup notifications={popups} userRole={userRole} onDismiss={dismissPopup} onOpenChat={openChat} onOpenAI={handleOpenAI}/>
      )}

      {/* Course Chat launcher -  ONLY for Lecturer, Class REP, and Asst. REP
          Regular students never see this button. They use the LRS Assistant nav tab. */}
      {(!hideFloatingLauncher && (userRole === "lecturer" || userRole === "rep" || userRole === "assistant_rep")) && (
        <div className="fixed bottom-6 left-6 z-[200] flex flex-col items-start gap-2">
          <button
            onClick={() => setShowLauncher(s => !s)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-2xl shadow-xl hover:bg-primary/90 transition-all"
          >
            <MessageSquare className="w-4 h-4"/>
            <span className="text-sm font-semibold">Course Chat</span>
            {accessibleRooms.length > 0 && (
              <span className="bg-emerald-400 text-emerald-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {accessibleRooms.length}
              </span>
            )}
          </button>

          {showLauncher && (
            <div className="bg-white rounded-2xl shadow-2xl border border-border overflow-hidden w-72">
              {/* Header */}
              <div className="px-4 py-3 bg-primary">
                <div className="text-white text-sm font-semibold">Course Chat Rooms</div>
                <div className="text-white/50 text-xs mt-0.5">
                  {userRole === "lecturer" ? "Communicate with your Class REPs" : "Communicate with your Lecturer"}
                </div>
              </div>

              {/* Role badge */}
              <div className="px-4 py-2 bg-muted/30 flex items-center gap-2 border-b border-border">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  userRole === "lecturer"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : userRole === "rep"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-violet-50 text-violet-700 border-violet-200"
                }`}>
                  {userRole === "lecturer" ? "Lecturer" : userRole === "rep" ? "Class REP" : "Asst. REP"}
                </span>
                <span className="text-xs text-muted-foreground">You can send messages</span>
              </div>

              {/* Room list */}
              {accessibleRooms.length > 0 ? (
                <div className="divide-y divide-border">
                  {accessibleRooms.map(r => {
                    const unread = r.messages.length;
                    return (
                      <button key={r.courseCode} onClick={() => { openChat(r.courseCode); setShowLauncher(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left group">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Hash className="w-4 h-4 text-primary"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-foreground">{r.courseCode}</div>
                          <div className="text-xs text-muted-foreground truncate">{r.courseTitle}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {r.participants.filter(p => p.role === "lecturer").map(p => p.name).join(", ")}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">{unread}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors"/>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2"/>
                  <p className="text-sm text-muted-foreground">No course chats available.</p>
                  <p className="text-xs text-muted-foreground mt-1">Contact your admin to be assigned as REP.</p>
                </div>
              )}

              {/* Info footer */}
              <div className="px-4 py-2.5 bg-muted/20 border-t border-border">
                <p className="text-xs text-muted-foreground">
                   Chat is between <strong>Lecturers</strong> and <strong>REPs</strong> only
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active course chat panel -  bottom right */}
      {openRoom && !hideFloatingLauncher && (
        <div className="fixed right-6 z-[190]" style={{ bottom: popups.filter(p => !p.dismissed).length > 0 ? "170px" : "24px" }}>
          <CourseChat
            room={openRoom}
            currentUser={currentUser}
            onClose={() => setOpenChatCode(null)}
            onOpenAI={undefined}
          />
        </div>
      )}
    </>
  );
}

export { SEED_POPUPS, SEED_ROOMS };

// --- Duplicate seed export guard ---------------------------------------------
// (SEED_POPUPS and SEED_ROOMS already exported above)

// ==============================================================================
// INLINE LRS ASSISTANT   full-page version for the student AI tab
// ==============================================================================

interface InlineAIAssistantProps {
  studentId: string;
  studentName: string;
  studentLevel: string;
  enrolledCourses: string[];
  initialMessages?: AIMessage[];
  isEmbedded?: boolean;
  onSaveAIMessages?: (studentId: string, messages: AIMessage[]) => Promise<void>;
}

export function InlineAIAssistant({ studentId, studentName, studentLevel, enrolledCourses, initialMessages, isEmbedded, onSaveAIMessages }: InlineAIAssistantProps) {
  const safeStudentName = studentName?.split(" ")[0] || "student";
  const initialPrompt: AIMessage = {
    id: "ai0", role: "assistant",
    content: `Hi ${safeStudentName}!  I'm **LRS Assistant**, your personal study AI.\n\nYou're in **${studentLevel}L**, enrolled in: **${enrolledCourses.join(", ")}**.\n\nI can help you with:\n- Explaining lecture topics\n- Generating practice questions & quizzes\n- Creating study summaries\n- Assignment guidance\n- Personalised study plans\n\nWhat would you like help with today?`,
    timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages && initialMessages.length > 0 ? initialMessages : [initialPrompt]);

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(enrolledCourses[0] ?? "");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const systemPrompt = `You are LRS Assistant, the official AI study assistant for a Nigerian university Lecture Reminder System.
  Student: ${studentName}, Level: ${studentLevel}L. Enrolled: ${enrolledCourses.join(", ")}.
  Currently discussing: ${selectedCourse || "general topics"}.
  Be concise, clear, and encouraging. Use Nigerian academic context where relevant.
  Format responses with markdown: **bold** key terms, use bullet points for lists.
  Never complete full assignments for students   guide and explain instead.`;

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: AIMessage = {
      id: `u${Date.now()}`, role: "user", content,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };
    const tid = `t${Date.now()}`;
    const assistantPlaceholder: AIMessage = { id: tid, role: "assistant", content: "", timestamp: "", isStreaming: true };
    let updated = [...messages, userMsg, assistantPlaceholder];

    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const reply = await callLRSAssistant(content, messages, systemPrompt);
      updated = updated.map(m => m.id === tid
        ? { ...m, content: reply, timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), isStreaming: false }
        : m);
      setMessages(updated);
      if (onSaveAIMessages) await onSaveAIMessages(studentId, updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      updated = updated.map(m => m.id === tid
        ? { ...m, content: ` ${msg}`, timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), isStreaming: false }
        : m);
      setMessages(updated);
      if (onSaveAIMessages) await onSaveAIMessages(studentId, updated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col bg-card overflow-hidden ${isEmbedded ? "h-full" : "rounded-2xl border border-border"}`} style={isEmbedded ? undefined : { height: "calc(100vh - 130px)" }}>


      {/* -- Header -- */}
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white"/>
          </div>
          <div>
            <div className="text-white font-bold text-base">LRS Assistant</div>
            <div className="text-white/60 text-xs">{studentLevel}L · {enrolledCourses.length} course{enrolledCourses.length !== 1 ? "s" : ""}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">AI Active</span>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
        </div>
      </div>

      {/* -- Context Bar -- */}
      <div className="flex items-center gap-3 px-5 py-2.5 bg-violet-50 border-b border-violet-100 flex-shrink-0">
        <BookOpen className="w-4 h-4 text-violet-500 flex-shrink-0"/>
        <span className="text-xs text-violet-600 font-semibold">Course context:</span>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
          className="flex-1 text-xs bg-transparent text-violet-800 font-bold focus:outline-none border-0 cursor-pointer">
          {enrolledCourses.map(c => <option key={c} value={c}>{c}</option>)}
          <option value="">General (all courses)</option>
        </select>
        <span className="text-xs text-violet-400 font-mono">{studentLevel}L</span>
        <button
          onClick={() => setMessages([{ id: `r${Date.now()}`, role: "assistant", content: `Ready! Ask me anything about ${selectedCourse || "your courses"} `, timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }])}
          className="text-xs text-violet-400 hover:text-violet-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-violet-100"
          title="New conversation">
          <RefreshCw className="w-3 h-3"/> New chat
        </button>
      </div>

      {/* -- Messages -- */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "assistant"
              ? <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1"><Sparkles className="w-4 h-4 text-white"/></div>
              : <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1"><User className="w-4 h-4 text-white"/></div>
            }
            <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
              {msg.isStreaming
                ? <div className="bg-violet-50 border border-violet-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-violet-500 animate-spin"/>
                    <span className="text-sm text-violet-600">LRS Assistant is thinking...</span>
                  </div>
                : <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-muted/60 border border-border text-foreground rounded-bl-sm"
                      : "bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-br-sm"
                  }`}>
                    {msg.role === "assistant" ? renderMD(msg.content) : msg.content}
                  </div>
              }
              {msg.timestamp && !msg.isStreaming && (
                <span className="text-xs text-muted-foreground font-mono">{msg.timestamp}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* -- Quick Prompts -- */}
      <div className="px-5 py-3 border-t border-border bg-muted/10 flex-shrink-0">
        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Quick prompts</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => sendMessage(p)} disabled={loading}
              className="flex-shrink-0 text-xs border border-border bg-white hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 text-muted-foreground px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 whitespace-nowrap shadow-sm">
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* -- Input -- */}
      <div className="px-5 py-4 border-t border-border bg-card flex-shrink-0">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-input-background border border-border rounded-2xl px-4 py-3 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={`Ask LRS Assistant about ${selectedCourse || "your courses"}... (Enter to send)`}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
              rows={2}
              disabled={loading}
            />
          </div>
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 flex-shrink-0 shadow-lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"/>
          LRS Assistant · AI-powered study help for {studentName.split(" ")[0]}
        </p>
      </div>
    </div>
  );
}

interface ChatHubProps {
  userRole: UserRole;
  userId: string;
  userName: string;
  userLevel?: string;
  enrolledCourses: string[];
  activeChatRoom: string | null;
  setActiveChatRoom: (code: string | null) => void;
  rooms: CourseRoom[];
  onUpdateMessages?: (roomCode: string, messages: ChatMessage[]) => void;
  hideAI?: boolean;
  studentId?: string;
  aiInitialMessages?: AIMessage[];
  onSaveAIMessages?: (studentId: string, messages: AIMessage[]) => Promise<void>;
}

export function ChatHub({
  userRole,
  userId,
  userName,
  userLevel = "300",
  enrolledCourses,
  activeChatRoom,
  setActiveChatRoom,
  rooms,
  onUpdateMessages,
  hideAI = false
}: ChatHubProps) {
  const accessibleRooms = rooms.filter(r =>
    userRole === "lecturer" ? r.participants.some(p => p.role === "lecturer") :
    userRole === "rep" || userRole === "assistant_rep" ? r.participants.some(p => p.id === userId) :
    enrolledCourses.includes(r.courseCode)
  );

  const currentUser: ChatUser = { id: userId, name: userName, role: userRole };
  const openRoom = rooms.find(r => r.courseCode === activeChatRoom);
  const isStudent = userRole === "student" || userRole === "rep" || userRole === "assistant_rep";

  return (
    <div className="flex bg-card rounded-2xl border border-border overflow-hidden" style={{ height: "calc(100vh - 130px)" }}>
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-muted/10 flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-border bg-muted/20 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary"/>
          <span className="font-bold text-sm text-foreground">LRS Chat Hub</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
          {/* AI Assistant Section (only for students) */}
          {isStudent && !hideAI && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">AI Assistant</div>
              <button
                onClick={() => setActiveChatRoom("ai")}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeChatRoom === "ai"
                    ? "bg-violet-50 text-violet-700 border border-violet-100 font-semibold"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="w-4 h-4"/>
                <span>LRS Assistant</span>
                {activeChatRoom === "ai" && <span className="ml-auto w-1.5 h-1.5 bg-violet-500 rounded-full"/>}
              </button>
            </div>
          )}

          {/* Course Channels Section */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">Course Channels</div>
            {accessibleRooms.length > 0 ? (
              <div className="flex flex-col gap-1">
                {accessibleRooms.map(r => {
                  const isActive = activeChatRoom === r.courseCode;
                  return (
                    <button
                      key={r.courseCode}
                      onClick={() => setActiveChatRoom(r.courseCode)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors group ${
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/10 font-semibold"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Hash className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}/>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{r.courseCode}</div>
                        <div className="text-xs opacity-75 truncate">{r.courseTitle}</div>
                      </div>
                      {isActive && <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"/>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-2 py-3 text-xs text-muted-foreground text-center bg-muted/5 rounded-xl border border-dashed border-border">
                No course chats.
              </div>
            )}
          </div>
        </div>

        {/* User profile banner at the bottom of the sidebar */}
        <div className="p-3 border-t border-border bg-muted/20 flex items-center gap-2.5">
          <Avatar name={userName} role={userRole} size="sm"/>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-foreground truncate">{userName}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {userRole === "lecturer" ? "Lecturer" : userRole === "rep" ? "Class REP" : userRole === "assistant_rep" ? "Asst. REP" : "Student"}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-background flex flex-col min-w-0">
        {activeChatRoom === "ai" && isStudent ? (
          <div className="h-full">
            <InlineAIAssistant
              studentId={studentId ?? userId}
              studentName={userName}
              studentLevel={userLevel}
              enrolledCourses={enrolledCourses.length > 0 ? enrolledCourses : ["CSC301", "CSC401"]}
              initialMessages={aiInitialMessages}
              isEmbedded={true}
              onSaveAIMessages={onSaveAIMessages}
            />
          </div>
        ) : openRoom ? (
          <div className="h-full flex flex-col">
            <CourseChat
              room={openRoom}
              currentUser={currentUser}
              onClose={() => setActiveChatRoom(null)}
              onOpenAI={isStudent ? () => setActiveChatRoom("ai") : undefined}
              inline={true}
              onUpdateMessages={onUpdateMessages}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/5">
            <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-muted-foreground"/>
            </div>
            <h3 className="font-semibold text-foreground text-sm">Welcome to LRS Chat Hub</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
              Select a course channel from the sidebar to communicate with your class, or use the LRS Assistant for AI study help.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
