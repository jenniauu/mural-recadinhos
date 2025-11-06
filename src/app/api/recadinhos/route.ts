// src/app/api/recadinhos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Pusher from 'pusher';

const prisma = new PrismaClient();
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function GET() {
  try {
    const recadinhos = await prisma.recadinho.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(recadinhos);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar recadinhos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome, mensagem } = await request.json();
    if (!nome || !mensagem) {
      return NextResponse.json({ error: 'Nome e mensagem são obrigatórios' }, { status: 400 });
    }

    const recadinho = await prisma.recadinho.create({
      data: { nome, mensagem },
    });

    // Envia para Pusher em tempo real
    await pusher.trigger('mural-channel', 'new-recadinho', recadinho);

    return NextResponse.json(recadinho);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar recadinho' }, { status: 500 });
  }
}