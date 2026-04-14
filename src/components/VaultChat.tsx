import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Send, CornerUpLeft, Pencil, Trash2, X, Loader2, AlertTriangle, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = 'https://www.api.neext.online/api/chat';

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
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'hsl(45,100%,45%)',
    'hsl(195,80%,40%)',
    'hsl(280,60%,50%)',
    'hsl(160,60%,38%)',
    'hsl(15,80%,48%)',
    'hsl(235,60%,55%)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const color = getAvatarColor(name);
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-mono font-bold select-none border"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: `${color}22`,
        borderColor: `${color}55`,
        color,
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

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

  // Auto-scroll on new messages
  useEffect(() => {
    const visible = messages.filter(m => !m.apagado).length;
    if (visible > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevCountRef.current = visible;
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

  const visible = messages.filter(m => !m.apagado);
  const allCount = messages.filter(m => !m.apagado).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-xl border border-border/40 overflow-hidden"
      style={{
        height: 'calc(100vh - 112px)',
        background: 'hsl(220 30% 9% / 0.95)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="shrink-0 flex items-center gap-3 px-5 py-4 border-b border-white/5"
        style={{ background: 'hsl(220 35% 7% / 0.95)' }}
      >
        {/* Icon */}
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center">
            <MessageSquare size={18} className="text-primary" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[hsl(220,35%,7%)]" />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold text-foreground tracking-[0.15em] vault-text-glow leading-none">
            VAULT COMMS
          </p>
          <p className="font-mono text-[9px] text-muted-foreground/50 tracking-[0.25em] mt-0.5">
            CANAL OPERACIONAL — NEEXT
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/15 bg-primary/5">
          <Radio size={9} className="text-primary animate-pulse" />
          <span className="font-mono text-[9px] text-primary/70 tracking-widest">
            {allCount} MSG
          </span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <Loader2 size={26} className="animate-spin text-primary mx-auto" />
              <p className="font-mono text-[10px] text-muted-foreground/50 tracking-[0.3em]">
                RECEBENDO SINAL...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <AlertTriangle size={26} className="text-destructive mx-auto" />
              <p className="font-mono text-[10px] text-muted-foreground/50 tracking-[0.3em]">
                FALHA NA TRANSMISSÃO
              </p>
              <button
                onClick={fetchMessages}
                className="vault-badge rounded px-4 py-1.5 text-[10px] font-mono font-bold tracking-widest hover:opacity-90 transition-all"
              >
                RECONECTAR
              </button>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <MessageSquare size={32} className="text-muted-foreground/20 mx-auto" />
              <p className="font-mono text-[10px] text-muted-foreground/40 tracking-[0.3em]">
                SEM TRANSMISSÕES ATIVAS
              </p>
              <p className="font-mono text-[9px] text-muted-foreground/25 tracking-widest">
                INICIE O PRIMEIRO CONTATO
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.userId === uid;
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const isGrouped = prevMsg && prevMsg.userId === msg.userId && !prevMsg.apagado && !msg.apagado;

            if (msg.apagado) return (
              <div key={msg.id} className="flex justify-center py-0.5">
                <span className="font-mono text-[9px] text-muted-foreground/25 tracking-widest italic flex items-center gap-1.5">
                  <Trash2 size={9} /> transmissão apagada
                </span>
              </div>
            );

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-end gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'} ${isGrouped ? 'mt-0.5' : 'mt-3'}`}
                onMouseEnter={() => setHoveredId(msg.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Avatar */}
                <div className={`mb-0.5 ${isGrouped ? 'invisible' : ''}`}>
                  <Avatar name={msg.user} size={30} />
                </div>

                {/* Bubble + actions */}
                <div className={`flex flex-col max-w-[72%] ${isMine ? 'items-end' : 'items-start'}`}>
                  {/* Name row (only first in group) */}
                  {!isGrouped && (
                    <p className={`font-mono text-[9px] font-bold tracking-[0.15em] mb-1 px-1 ${
                      isMine ? 'text-primary/70' : 'text-muted-foreground/60'
                    }`}>
                      {isMine ? 'VOCÊ' : msg.user.toUpperCase()}
                    </p>
                  )}

                  {/* Reply quote */}
                  {msg.reply && (
                    <div
                      className={`mb-1 px-3 py-1.5 rounded-lg text-[10px] font-mono max-w-full border-l-2 ${
                        isMine ? 'border-primary/50' : 'border-muted-foreground/30'
                      }`}
                      style={{ background: 'hsl(220 30% 14% / 0.8)' }}
                    >
                      <span className="text-primary/80 font-bold block truncate">{msg.reply.nome}</span>
                      <span className="text-muted-foreground/60 truncate block">{msg.reply.texto}</span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMine
                        ? 'rounded-br-sm border border-primary/25'
                        : 'rounded-bl-sm border border-white/8'
                    }`}
                    style={{
                      background: isMine
                        ? 'hsl(45 100% 55% / 0.1)'
                        : 'hsl(220 30% 16% / 0.9)',
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    <p className="font-body whitespace-pre-wrap break-words">
                      {msg.texto}
                      {msg.editado && (
                        <span className="font-mono text-[8px] text-muted-foreground/40 ml-2 align-middle">
                          editado
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Hover actions */}
                  <AnimatePresence>
                    {hoveredId === msg.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 4 }}
                        transition={{ duration: 0.12 }}
                        className={`flex items-center gap-1 mt-1.5 ${isMine ? 'flex-row-reverse' : ''}`}
                      >
                        <button
                          onClick={() => startReply(msg)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border/40 bg-card/80 text-muted-foreground/60 hover:text-primary hover:border-primary/40 transition-all font-mono text-[9px] tracking-wider backdrop-blur-sm"
                        >
                          <CornerUpLeft size={9} /> reply
                        </button>
                        {isMine && (
                          <>
                            <button
                              onClick={() => startEdit(msg)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border/40 bg-card/80 text-muted-foreground/60 hover:text-blue-400 hover:border-blue-400/40 transition-all font-mono text-[9px] tracking-wider backdrop-blur-sm"
                            >
                              <Pencil size={9} />
                            </button>
                            <button
                              onClick={() => handleDelete(msg.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border/40 bg-card/80 text-muted-foreground/60 hover:text-destructive hover:border-destructive/40 transition-all font-mono text-[9px] tracking-wider backdrop-blur-sm"
                            >
                              <Trash2 size={9} />
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
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
              <div
                className={`w-0.5 self-stretch rounded-full ${editingId ? 'bg-blue-400/70' : 'bg-primary/70'}`}
              />
              <div className="flex-1 min-w-0">
                <p className={`font-mono text-[9px] font-bold tracking-widest ${editingId ? 'text-blue-400/80' : 'text-primary/80'}`}>
                  {editingId ? 'EDITANDO' : `REPLY → ${replyTo?.nome.toUpperCase()}`}
                </p>
                {replyTo && !editingId && (
                  <p className="font-mono text-[9px] text-muted-foreground/50 truncate mt-0.5">
                    {replyTo.texto}
                  </p>
                )}
              </div>
              <button
                onClick={() => { cancelEdit(); setReplyTo(null); }}
                className="w-6 h-6 flex items-center justify-center rounded-lg border border-border/30 text-muted-foreground/50 hover:text-destructive hover:border-destructive/30 transition-all"
              >
                <X size={11} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input ── */}
      <div
        className="shrink-0 px-4 py-3 border-t border-white/5 flex items-center gap-3"
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
            className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:border-primary/50 focus:bg-white/6 transition-all"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          data-testid="btn-send-message"
          className="w-10 h-10 rounded-xl flex items-center justify-center vault-badge border border-primary/40 hover:border-primary transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          style={{ boxShadow: text.trim() ? '0 0 16px hsl(45 100% 55% / 0.2)' : 'none' }}
        >
          {sending
            ? <Loader2 size={15} className="animate-spin text-background" />
            : <Send size={15} className="text-background" />
          }
        </button>
      </div>
    </motion.div>
  );
}
