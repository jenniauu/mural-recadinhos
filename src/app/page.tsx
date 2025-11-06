// src/app/page.tsx
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
    // Carrega recadinhos iniciais
    fetchRecadinhos();

    // Configura Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe('mural-channel');
    channel.bind('new-recadinho', (data: Recadinho) => {
      setRecadinhos((prev) => [data, ...prev]);
    });

    return () => {
      pusher.disconnect();
    };
  }, []);

  const fetchRecadinhos = async () => {
    const res = await fetch('/api/recadinhos');
    const data = await res.json();
    setRecadinhos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/recadinhos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, mensagem }),
    });
    if (res.ok) {
      setNome('');
      setMensagem('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-pink-800">Mural de Recadinhos</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
          <textarea
            placeholder="Deixe seu recadinho fofo aqui..."
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-800 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Recadinho'}
          </button>
        </form>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {recadinhos.map((rec) => (
            <div key={rec.id} className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
              <h3 className="font-bold text-pink-800">{rec.nome}</h3>
              <p className="text-gray-700 mt-1">{rec.mensagem}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(rec.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
          ))}
          {recadinhos.length === 0 && (
            <p className="text-center text-gray-500 italic">Aguardando os primeiros recadinhos... 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
}
