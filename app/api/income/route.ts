import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, description, date, category_id, notes } = body;

    // Validar datos requeridos
    if (!amount || !description || !date || !category_id) {
      return NextResponse.json({ 
        error: 'Faltan campos requeridos' 
      }, { status: 400 });
    }

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

    // Crear el ingreso
    const { data: income, error } = await supabase
      .from('income')
      .insert({
        user_id: user.id,
        amount: parseFloat(amount),
        description,
        date,
        category_id,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        error: 'Error al crear el ingreso' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Ingreso creado exitosamente', 
      income 
    });

  } catch {
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

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

    // Obtener ingresos del usuario
    const { data: incomes, error } = await supabase
      .from('income')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      return NextResponse.json({ 
        error: 'Error al obtener ingresos' 
      }, { status: 500 });
    }

    return NextResponse.json({ incomes });

  } catch {
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
