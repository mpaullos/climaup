import React, { useState } from 'react';
import { KeyRound, ExternalLink, Check, X } from 'lucide-react';

interface ApiKeyBannerProps {
  onSaveKey: (key: string) => void;
  needsApiKey: boolean;
  hasServerKey?: boolean;
}

export const ApiKeyBanner: React.FC<ApiKeyBannerProps> = ({
  onSaveKey,
  needsApiKey,
  hasServerKey = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Se a chave já existir no ambiente (.env), o botão e banner NUNCA aparecem
  if (hasServerKey || !needsApiKey) {
    return null;
  }

  // Se a chave não existir e o banner estiver fechado, mostra o botão discreto para configurar
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-md text-amber-200 hover:text-white px-3.5 py-1.5 rounded-full text-xs flex items-center gap-2 border border-amber-400/30 transition-all shadow-lg"
        aria-label="Configurar chave da API OpenWeatherMap"
      >
        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
        <span>Chave OpenWeather (Necessária)</span>
      </button>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      onSaveKey(apiKeyInput.trim());
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setIsOpen(false);
      }, 1500);
    }
  };

  return (
    <aside
      aria-label="Configuração da Chave de API do OpenWeatherMap"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-slate-900/95 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-2xl text-white text-xs animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
          <h2 className="font-semibold text-sm text-white">Chave OpenWeatherMap</h2>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/40 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Fechar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-white/70 mb-3 leading-relaxed">
        Para carregar previsões ao vivo de qualquer cidade do mundo, defina{' '}
        <code className="text-amber-300 bg-white/10 px-1 py-0.5 rounded font-mono text-[11px]">
          OPENWEATHER_API_KEY
        </code>{' '}
        no arquivo <code className="text-white/90">.env</code> do servidor.
      </p>

      <form onSubmit={handleSave} className="flex gap-2 mb-2">
        <input
          type="text"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="Ou cole sua chave aqui..."
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shrink-0"
        >
          {savedSuccess ? <Check className="w-3.5 h-3.5" /> : 'Salvar'}
        </button>
      </form>

      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] text-white/50">
        <a
          href="https://openweathermap.org/api"
          target="_blank"
          rel="noreferrer noopener"
          className="hover:text-amber-300 transition-colors flex items-center gap-1 underline"
        >
          <span>Obter chave gratuita</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <span className="text-white/40">Dados protegidos no backend</span>
      </div>
    </aside>
  );
};
