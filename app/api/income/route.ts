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

    // Crear el registro de ingreso directamente con el user.id
    const { data: incomeData, error: insertError } = await supabase
      .from('income')
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
      console.error('Error al crear ingreso:', insertError);
      return NextResponse.json({ 
        error: 'Error al crear el ingreso' 
      }, { status: 500 });
    }

    return NextResponse.json(incomeData);
  } catch (error) {
    console.error('Error en POST /api/income:', error);
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

    // Obtener todos los ingresos del usuario con información de categoría
    const { data: income, error: selectError } = await supabase
      .from('income')
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
      console.error('Error al obtener ingresos:', selectError);
      return NextResponse.json({ 
        error: 'Error al obtener los ingresos' 
      }, { status: 500 });
    }

    return NextResponse.json(income || []);
  } catch (error) {
    console.error('Error en GET /api/income:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
