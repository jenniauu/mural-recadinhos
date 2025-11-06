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

    // Configura Pusher com fallback seguro
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || 'sua_key_temporaria';
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu';

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
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
    try {
      const res = await fetch('/api/recadinhos');
      if (res.ok) {
        const data = await res.json();
        setRecadinhos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar recadinhos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !mensagem.trim()) return;

    setLoading(true);
    try {
      await fetch('/api/recadinhos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, mensagem }),
      });
      setNome('');
      setMensagem('');
    } catch (error) {
      console.error('Erro ao enviar:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 mt-10">
        <h1 className="text-3xl font-bold text-center text-pink-800 mb-6">
          Mural de Recadinhos
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
            required
          />
          <textarea
            placeholder="Deixe seu recadinho fofo..."
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={3}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold hover:bg-pink-800 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recadinhos.length === 0 ? (
            <p className="text-center text-gray-500 italic">
              Ainda não tem recadinhos... Seja o primeiro!
            </p>
          ) : (
            recadinhos.map((r) => (
              <div key={r.id} className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
                <p className="font-bold text-pink-800">{r.nome}</p>
                <p className="text-gray-700">{r.mensagem}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(r.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}   ))
          )}
        </div>
      </div>
    </div>
  );
}
