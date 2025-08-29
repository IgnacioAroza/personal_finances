import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
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

    // Crear el registro de gasto directamente con el user.id
    const { data: expenseData, error: insertError } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        amount: parseFloat(amount),
        description,
        date,
        category_id,
        notes: notes || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error al crear gasto:', insertError);
      return NextResponse.json({ 
        error: 'Error al crear el gasto' 
      }, { status: 500 });
    }

    return NextResponse.json(expenseData);
  } catch (error) {
    console.error('Error en POST /api/expenses:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener todos los gastos del usuario con información de categoría
    const { data: expenses, error: selectError } = await supabase
      .from('expenses')
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (selectError) {
      console.error('Error al obtener gastos:', selectError);
      return NextResponse.json({ 
        error: 'Error al obtener los gastos' 
      }, { status: 500 });
    }

    return NextResponse.json(expenses || []);
  } catch (error) {
    console.error('Error en GET /api/expenses:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
