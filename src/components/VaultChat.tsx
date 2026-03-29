import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Reply, Pencil, Trash2, X,
  Radio, Loader2, AlertTriangle, CornerUpLeft
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

export default function VaultChat({ userName }: VaultChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyRef | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
        body: JSON.stringify({
          user: userName,
          userId: uid,
          texto: trimmed,
          reply: replyTo,
        }),
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

  const cancelEdit = () => {
    setEditingId(null);
    setText('');
  };

  const startReply = (msg: ChatMessage) => {
    setReplyTo({ id: msg.id, nome: msg.user, texto: msg.texto });
    setEditingId(null);
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === 'Escape') { cancelEdit(); setReplyTo(null); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[calc(100vh-120px)] rounded-lg border border-border/50 overflow-hidden vault-scanline"
      style={{ background: 'hsl(220 30% 11% / 0.85)' }}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-border/40"
        style={{ background: 'hsl(220 35% 9% / 0.9)' }}>
        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
          <MessageSquare size={16} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-display text-xs font-bold text-primary tracking-[0.2em] vault-text-glow">
            VAULT COMMS
          </p>
          <p className="font-mono text-[9px] text-muted-foreground tracking-widest">
            CANAL OPERACIONAL NEEXT
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio size={10} className="text-primary animate-pulse" />
          <span className="font-mono text-[10px] text-primary/70">
            {messages.filter(m => !m.apagado).length} TRANSMISSÕES
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 size={28} className="animate-spin text-primary mx-auto mb-2" />
              <p className="font-mono text-xs text-muted-foreground tracking-widest">RECEBENDO SINAL...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertTriangle size={28} className="text-destructive mx-auto mb-2" />
              <p className="font-mono text-xs text-muted-foreground tracking-widest">FALHA NA TRANSMISSÃO</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare size={32} className="text-muted-foreground/30 mx-auto mb-2" />
              <p className="font-mono text-xs text-muted-foreground tracking-widest">SEM TRANSMISSÕES</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.userId === uid;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: isMine ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-col max-w-[80%] ${isMine ? 'ml-auto items-end' : 'items-start'}`}
              >
                {/* Reply reference */}
                {msg.reply && !msg.apagado && (
                  <div
                    className={`mb-1 px-3 py-1.5 rounded text-[10px] font-mono border-l-2 border-primary/60 max-w-full truncate ${
                      isMine ? 'bg-primary/10' : 'bg-muted/30'
                    }`}
                    style={{ background: 'hsl(220 30% 8% / 0.7)' }}
                  >
                    <span className="text-primary font-semibold">{msg.reply.nome}</span>
                    <span className="text-muted-foreground ml-1 truncate">{msg.reply.texto}</span>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`px-4 py-3 rounded-lg relative group ${
                    msg.apagado
                      ? 'opacity-50 border border-border/30'
                      : isMine
                      ? 'border border-primary/30 vault-badge'
                      : 'border border-border/40'
                  }`}
                  style={{
                    background: msg.apagado
                      ? 'hsl(220 25% 12% / 0.5)'
                      : isMine
                      ? 'hsl(45 100% 55% / 0.08)'
                      : 'hsl(220 30% 15% / 0.8)',
                  }}
                >
                  {/* Sender name */}
                  <p className={`font-mono text-[10px] font-bold tracking-widest mb-1 ${
                    isMine ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {isMine ? '// VOCÊ' : `// ${msg.user.toUpperCase()}`}
                  </p>

                  {/* Content */}
                  {msg.apagado ? (
                    <p className="font-mono text-xs text-muted-foreground italic flex items-center gap-1.5">
                      <Trash2 size={11} /> TRANSMISSÃO APAGADA
                    </p>
                  ) : (
                    <p className="font-body text-sm text-foreground leading-relaxed">
                      {msg.texto}
                      {msg.editado && (
                        <span className="font-mono text-[9px] text-muted-foreground ml-2">(editado)</span>
                      )}
                    </p>
                  )}

                  {/* Action buttons — appear on hover */}
                  {!msg.apagado && (
                    <div className={`flex gap-1 mt-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <button
                        onClick={() => startReply(msg)}
                        data-testid={`btn-reply-${msg.id}`}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border border-border/40 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
                      >
                        <CornerUpLeft size={10} /> RESPONDER
                      </button>
                      {isMine && (
                        <>
                          <button
                            onClick={() => startEdit(msg)}
                            data-testid={`btn-edit-${msg.id}`}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border border-border/40 text-muted-foreground hover:border-vault-blue/60 hover:text-blue-400 transition-all"
                          >
                            <Pencil size={10} /> EDITAR
                          </button>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            data-testid={`btn-delete-${msg.id}`}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border border-border/40 text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-all"
                          >
                            <Trash2 size={10} /> EXCLUIR
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Reply / Edit preview bar */}
      <AnimatePresence>
        {(replyTo || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 border-t border-primary/20 px-4 py-2 flex items-center justify-between gap-3"
            style={{ background: 'hsl(220 35% 9% / 0.9)' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              {editingId ? (
                <Pencil size={12} className="text-blue-400 shrink-0" />
              ) : (
                <Reply size={12} className="text-primary shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-mono text-[10px] text-primary/70 tracking-widest">
                  {editingId ? 'EDITANDO TRANSMISSÃO' : `RESPONDENDO A ${replyTo?.nome.toUpperCase()}`}
                </p>
                {replyTo && !editingId && (
                  <p className="font-mono text-[10px] text-muted-foreground truncate">{replyTo.texto}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => { cancelEdit(); setReplyTo(null); }}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded border border-border/40 hover:border-destructive/50 hover:text-destructive text-muted-foreground transition-all"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="shrink-0 border-t border-border/40 px-4 py-3 flex gap-3 items-center"
        style={{ background: 'hsl(220 35% 9% / 0.9)' }}>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={editingId ? 'EDITANDO...' : 'TRANSMITIR MENSAGEM...'}
          data-testid="input-chat-message"
          className="flex-1 bg-transparent border border-border/50 rounded px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          data-testid="btn-send-message"
          className="w-10 h-10 rounded-lg flex items-center justify-center vault-badge border border-primary/40 hover:border-primary/80 text-background disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </motion.div>
  );
}
