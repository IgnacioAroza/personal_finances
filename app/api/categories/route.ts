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

    // Limpiar y validar el nombre
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return NextResponse.json({ 
        error: 'El nombre no puede estar vacío' 
      }, { status: 400 });
    }

    if (trimmedName.length > 50) {
      return NextResponse.json({ 
        error: 'El nombre no puede exceder 50 caracteres' 
      }, { status: 400 });
    }

    // Validar tipo
    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json({ 
        error: 'Tipo de categoría inválido' 
      }, { status: 400 });
    }

    // Verificar si ya existe una categoría con el mismo nombre y tipo para este usuario
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', trimmedName)
      .eq('type', type)
      .eq('is_active', true)
      .maybeSingle();

    if (checkError) {
      console.error('Error al verificar categoría existente:', checkError);
      return NextResponse.json({ 
        error: 'Error al verificar la categoría' 
      }, { status: 500 });
    }

    if (existingCategory) {
      return NextResponse.json({ 
        error: 'Ya existe una categoría con este nombre para este tipo' 
      }, { status: 409 });
    }

    // Crear la categoría
    const { data: categoryData, error: insertError } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: trimmedName,
        type,
        icon,
        color,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error al crear categoría:', insertError);
      
      // Manejar errores específicos de duplicados a nivel de BD
      if (insertError.code === '23505') {
        return NextResponse.json({ 
          error: 'Ya existe una categoría con este nombre' 
        }, { status: 409 });
      }
      
      return NextResponse.json({ 
        error: 'Error al crear la categoría',
        details: insertError.message
      }, { status: 500 });
    }

    return NextResponse.json({ category: categoryData });
  } catch (error) {
    console.error('Error en POST /api/categories:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
