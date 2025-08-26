import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'No autorizado',
        details: authError?.message || 'Usuario no encontrado' 
      }, { status: 401 });
    }

    // Obtener query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Filtrar por tipo si se especifica
    if (type && ['income', 'expense'].includes(type)) {
      query = query.eq('type', type);
    }

    const { data: categories, error: selectError } = await query
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (selectError) {
      console.error('Error al obtener categorías:', selectError);
      return NextResponse.json({ 
        error: 'Error al obtener las categorías',
        details: selectError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ categories: categories || [] });
  } catch (error) {
    console.error('Error en GET /api/categories:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, icon, color } = body;

    // Validar datos requeridos
    if (!name || !type || !icon || !color) {
      return NextResponse.json({ 
        error: 'Faltan campos requeridos' 
      }, { status: 400 });
    }

    // Validar tipo
    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json({ 
        error: 'Tipo de categoría inválido' 
      }, { status: 400 });
    }

    // Crear la categoría
    const { data: categoryData, error: insertError } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name,
        type,
        icon,
        color,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error al crear categoría:', insertError);
      return NextResponse.json({ 
        error: 'Error al crear la categoría' 
      }, { status: 500 });
    }

    return NextResponse.json(categoryData);
  } catch (error) {
    console.error('Error en POST /api/categories:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
