'use client';

import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';

interface Recadinho {
  id: string;
  nome: string;
  mensagem: string;
  createdAt: string;
}

export default function Home() {
  const [recadinhos, setRecadinhos] = useState<Recadinho[]>([]);
  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecadinhos();

    const pusher = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY || 'fallback-key',
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      }
    );

    const channel = pusher.subscribe('mural-channel');
    channel.bind('new-recadinho', (data: Recadinho) => {
      setRecadinhos((prev) => [data, ...prev]);
    });

    return () => pusher.disconnect();
  }, []);

  const fetchRecadinhos = async () => {
    try {
      const res = await fetch('/api/recadinhos');
      if (res.ok) {
        const data = await res.json();
        setRecadinhos(data);
      }
    } catch (err) {
      console.error('Erro ao carregar:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !mensagem.trim()) return;

    setLoading(true);
    await fetch('/api/recadinhos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, mensagem }),
    });

    setNome('');
    setMensagem('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 mt-10">
        <h1 className="text-4xl font-bold text-center text-purple-600 mb-8">
          Mural de Recadinhos
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-4 border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-400 focus:outline-none"
            required
          />
          <textarea
            placeholder="Deixe seu recadinho fofo..."
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={4}
            className="w-full p-4 border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-400 focus:outline-none resize-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition"
          >
            {loading ? 'Enviando...' : 'Enviar Recadinho'}
          </button>
        </form>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {recadinhos.length === 0 ? (
            <p className="text-center text-gray-500 italic py-8">
              Ainda não tem recadinhos... Seja o primeiro!
            </p>
          ) : (
            recadinhos.map((r) => (
              <div
                key={r.id}
                className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl border-l-8 border-purple-400 shadow-md"
              >
                <p className="font-bold text-purple-700 text-lg">{r.nome}</p>
                <p className="text-gray-800 mt-2 leading-relaxed">{r.mensagem}</p>
                <p className="text-xs text-gray-500 mt-3 text-right">
                  {new Date(r.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
