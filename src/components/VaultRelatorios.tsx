import { FileText } from 'lucide-react';

export default function VaultRelatorios() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
        <FileText size={32} className="text-primary/60" />
      </div>
      <p className="font-display text-lg font-bold tracking-widest text-primary/60 vault-text-glow">
        MÓDULO EM CONSTRUÇÃO
      </p>
      <p className="font-mono text-xs text-muted-foreground tracking-widest">
        AGUARDANDO ARQUIVOS DO OPERADOR...
      </p>
    </div>
  );
}
