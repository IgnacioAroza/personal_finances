import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'income' o 'expense'

    const supabase = createServerClient();

    // Obtener el user_id de Supabase
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error('Error obteniendo categorías:', error);
      return NextResponse.json({ error: 'Error obteniendo categorías' }, { status: 500 });
    }

    return NextResponse.json({ categories });

  } catch (error) {
    console.error('Error en GET /api/categories:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
