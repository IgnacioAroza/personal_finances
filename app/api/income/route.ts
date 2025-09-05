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
    if (!amount || !date || !category_id) {
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
        description: description ?? null,
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

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Parsear parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Validar parámetros de rango
    if ((from && !to) || (!from && to)) {
      return NextResponse.json({ 
        error: 'Debe proporcionar ambos parámetros: from y to' 
      }, { status: 400 });
    }

    // Validar formato de fechas
    if (from && to) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(from) || !dateRegex.test(to)) {
        return NextResponse.json({ 
          error: 'Rango de fechas inválido. Use formato YYYY-MM-DD' 
        }, { status: 400 });
      }
    }

    // Construir query base
    let query = supabase
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
      .eq('user_id', user.id);

    // Aplicar filtro de rango si se proporciona
    if (from && to) {
      query = query.gte('date', from).lte('date', to);
    }

    // Ejecutar query con ordenamiento
    const { data: income, error: selectError } = await query
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
