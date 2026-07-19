import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Reply, Pencil, Trash2, X,
  Radio, Loader2, AlertTriangle, CornerUpLeft, Zap
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = 'https://www.esdeath-api.com.br/api/chat';

interface ReplyRef {
  id: string;
  nome: string;
  texto: string;
}

interface ChatMessage {
  id: string;
  user: string;
  userId: string;
  texto: string;
  apagado: boolean;
  editado?: boolean;
  reply?: ReplyRef | null;
}

interface VaultChatProps {
  userName: string;
}

const uid = (() => {
  let id = localStorage.getItem('vault_uid');
  if (!id) { id = Date.now().toString(); localStorage.setItem('vault_uid', id); }
  return id;
})();

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

function getAvatarHue(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hues = [195, 280, 160, 15, 235, 320, 50];
  return hues[Math.abs(hash) % hues.length];
}

function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const hue = getAvatarHue(name);
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-mono font-bold select-none border-2"
      style={{
        width: size, height: size,
        fontSize: size * 0.33,
        background: `hsl(${hue} 60% 18%)`,
        borderColor: `hsl(${hue} 60% 40% / 0.5)`,
        color: `hsl(${hue} 80% 65%)`,
        letterSpacing: '0.05em',
      }}
    >
      {getInitials(name)}
    </div>
  );
}

export default function VaultChat({ userName }: VaultChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyRef | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error();
      const data: ChatMessage[] = await res.json();
      setMessages(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    const visible = messages.filter(m => !m.apagado).length;
    if (visible > prevLenRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevLenRef.current = visible;
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    if (editingId) {
      setSending(true);
      try {
        await fetch(`${API_BASE}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texto: trimmed }),
        });
        setEditingId(null);
        setText('');
        await fetchMessages();
        toast.success('Mensagem editada');
      } catch {
        toast.error('Erro ao editar mensagem');
      } finally {
        setSending(false);
      }
      return;
    }

    setSending(true);
    try {
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userName, userId: uid, texto: trimmed, reply: replyTo }),
      });
      setText('');
      setReplyTo(null);
      await fetchMessages();
    } catch {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      await fetchMessages();
      toast.success('Mensagem removida');
    } catch {
      toast.error('Erro ao remover mensagem');
    }
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setText(msg.texto);
    setReplyTo(null);
    inputRef.current?.focus();
  };

  const cancelEdit = () => { setEditingId(null); setText(''); };

  const startReply = (msg: ChatMessage) => {
    setReplyTo({ id: msg.id, nome: msg.user, texto: msg.texto });
    setEditingId(null);
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === 'Escape') { cancelEdit(); setReplyTo(null); }
  };

  const visibleCount = messages.filter(m => !m.apagado).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-xl border border-primary/15 overflow-hidden"
      style={{
        height: 'calc(100vh - 112px)',
        background: 'hsl(220 32% 9% / 0.97)',
        boxShadow: '0 0 40px hsl(45 100% 55% / 0.04), inset 0 1px 0 hsl(45 100% 55% / 0.08)',
      }}
    >
      {/* ── Top accent bar ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent shrink-0" />

      {/* ── Header ── */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-white/5"
        style={{ background: 'hsl(220 35% 7% / 0.95)' }}
      >
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center">
            <MessageSquare size={16} className="text-primary" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-[2px] border-[hsl(220,35%,7%)]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display text-[11px] sm:text-xs font-bold text-primary tracking-[0.2em] vault-text-glow leading-none">
            VAULT COMMS
          </p>
          <p className="font-mono text-[8px] sm:text-[9px] text-muted-foreground/50 tracking-[0.2em] mt-0.5">
            CANAL OPERACIONAL — NEEXT
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-primary/15 bg-primary/5 shrink-0">
          <Radio size={9} className="text-primary animate-pulse" />
          <span className="font-mono text-[9px] text-primary/60 tracking-widest">
            {visibleCount}
          </span>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <Loader2 size={26} className="animate-spin text-primary mx-auto" />
              <p className="font-mono text-[10px] text-muted-foreground/50 tracking-[0.3em]">RECEBENDO SINAL...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <AlertTriangle size={26} className="text-destructive mx-auto" />
              <p className="font-mono text-[10px] text-muted-foreground/50 tracking-[0.3em]">FALHA NA TRANSMISSÃO</p>
              <button onClick={fetchMessages} className="vault-badge rounded px-4 py-1.5 font-mono text-[10px] font-bold tracking-widest hover:opacity-90 transition-all">
                RECONECTAR
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <MessageSquare size={32} className="text-muted-foreground/20 mx-auto" />
              <p className="font-mono text-[10px] text-muted-foreground/35 tracking-[0.3em]">SEM TRANSMISSÕES</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.userId === uid;
            const prev = idx > 0 ? messages[idx - 1] : null;
            const grouped = !msg.apagado && prev && !prev.apagado && prev.userId === msg.userId;

            if (msg.apagado) {
              return (
                <div key={msg.id} className="flex justify-center py-1">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground/25 tracking-widest italic px-3 py-1 rounded-full border border-white/5">
                    <Trash2 size={9} /> transmissão apagada
                  </span>
                </div>
              );
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'} ${grouped ? 'mt-0.5' : 'mt-3'}`}
              >
                {/* Avatar */}
                <div className={grouped ? 'invisible' : ''}>
                  <Avatar name={msg.user} size={32} />
                </div>

                {/* Content */}
                <div className={`flex flex-col gap-1 max-w-[82%] sm:max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
                  {/* Name */}
                  {!grouped && (
                    <p className={`font-mono text-[9px] font-bold tracking-[0.15em] px-1 ${
                      isMine ? 'text-primary/70' : 'text-muted-foreground/55'
                    }`}>
                      {isMine ? 'VOCÊ' : msg.user.toUpperCase()}
                    </p>
                  )}

                  {/* Reply quote */}
                  {msg.reply && (
                    <div
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono max-w-full border-l-2 ${
                        isMine ? 'border-primary/50' : 'border-muted-foreground/30'
                      }`}
                      style={{ background: 'hsl(220 30% 13% / 0.9)' }}
                    >
                      <span className={`font-bold block truncate ${isMine ? 'text-primary/80' : 'text-muted-foreground/80'}`}>
                        {msg.reply.nome}
                      </span>
                      <span className="text-muted-foreground/50 truncate block">{msg.reply.texto}</span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl w-full ${
                      isMine
                        ? 'rounded-br-sm border border-primary/20'
                        : 'rounded-bl-sm border border-white/8'
                    }`}
                    style={{
                      background: isMine
                        ? 'hsl(45 80% 50% / 0.09)'
                        : 'hsl(220 28% 17% / 0.95)',
                    }}
                  >
                    <p className="font-body text-sm text-foreground leading-relaxed break-words">
                      {msg.texto}
                      {msg.editado && (
                        <span className="font-mono text-[8px] text-muted-foreground/35 ml-2 align-middle">editado</span>
                      )}
                    </p>
                  </div>

                  {/* Action buttons — always visible */}
                  <div className={`flex items-center gap-1 flex-wrap ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <button
                      onClick={() => startReply(msg)}
                      data-testid={`btn-reply-${msg.id}`}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/8 bg-white/3 font-mono text-[9px] text-muted-foreground/50 hover:text-primary hover:border-primary/30 active:scale-95 transition-all"
                    >
                      <CornerUpLeft size={9} />
                      <span className="hidden xs:inline">reply</span>
                    </button>
                    {isMine && (
                      <>
                        <button
                          onClick={() => startEdit(msg)}
                          data-testid={`btn-edit-${msg.id}`}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/8 bg-white/3 font-mono text-[9px] text-muted-foreground/50 hover:text-blue-400 hover:border-blue-400/30 active:scale-95 transition-all"
                        >
                          <Pencil size={9} />
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          data-testid={`btn-delete-${msg.id}`}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/8 bg-white/3 font-mono text-[9px] text-muted-foreground/50 hover:text-destructive hover:border-destructive/30 active:scale-95 transition-all"
                        >
                          <Trash2 size={9} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Reply / Edit bar ── */}
      <AnimatePresence>
        {(replyTo || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="shrink-0 overflow-hidden"
          >
            <div
              className="flex items-center gap-3 px-4 py-2.5 border-t border-white/5"
              style={{ background: 'hsl(220 35% 7% / 0.95)' }}
            >
              <div className={`w-0.5 self-stretch rounded-full shrink-0 ${editingId ? 'bg-blue-400/60' : 'bg-primary/60'}`} />
              {editingId
                ? <Pencil size={11} className="text-blue-400/70 shrink-0" />
                : <Reply size={11} className="text-primary/70 shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className={`font-mono text-[9px] font-bold tracking-widest ${editingId ? 'text-blue-400/70' : 'text-primary/70'}`}>
                  {editingId ? 'EDITANDO' : `REPLY → ${replyTo?.nome.toUpperCase()}`}
                </p>
                {replyTo && !editingId && (
                  <p className="font-mono text-[9px] text-muted-foreground/40 truncate mt-0.5">{replyTo.texto}</p>
                )}
              </div>
              <button
                onClick={() => { cancelEdit(); setReplyTo(null); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/8 text-muted-foreground/40 hover:text-destructive hover:border-destructive/30 transition-all shrink-0"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input area ── */}
      <div
        className="shrink-0 border-t border-white/5 px-3 sm:px-4 py-3 flex items-center gap-2.5"
        style={{ background: 'hsl(220 35% 7% / 0.95)' }}
      >
        <Avatar name={userName} size={30} />

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder={editingId ? 'Editar mensagem...' : 'Enviar transmissão...'}
            data-testid="input-chat-message"
            className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 focus:bg-white/7 transition-all"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          data-testid="btn-send-message"
          className="w-10 h-10 rounded-xl flex items-center justify-center vault-badge border border-primary/40 hover:border-primary/80 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          style={{
            boxShadow: text.trim() ? '0 0 18px hsl(45 100% 55% / 0.25)' : 'none',
          }}
        >
          {sending
            ? <Loader2 size={15} className="animate-spin text-background" />
            : <Send size={15} className="text-background" />
          }
        </button>
      </div>

      {/* ── Bottom accent bar ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent shrink-0" />
    </motion.div>
  );
}
