import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Obtener la categoría específica del usuario
    const { data: category, error: selectError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (selectError) {
      if (selectError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
      }
      console.error('Error al obtener categoría:', selectError);
      return NextResponse.json({ 
        error: 'Error al obtener la categoría' 
      }, { status: 500 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error en GET /api/categories/[id]:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, type, icon, color, is_active } = body;

    // Validar que la categoría pertenece al usuario
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingCategory) {
      return NextResponse.json({ 
        error: 'Categoría no encontrada o no autorizada' 
      }, { status: 404 });
    }

    // Preparar campos para actualizar
    const updateFields: {
      name?: string;
      type?: 'income' | 'expense';
      icon?: string;
      color?: string;
      is_active?: boolean;
    } = {};
    
    if (name !== undefined) updateFields.name = name;
    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return NextResponse.json({ 
          error: 'Tipo de categoría inválido' 
        }, { status: 400 });
      }
      updateFields.type = type;
    }
    if (icon !== undefined) updateFields.icon = icon;
    if (color !== undefined) updateFields.color = color;
    if (is_active !== undefined) updateFields.is_active = is_active;

    // Actualizar la categoría
    const { data: updatedCategory, error: updateError } = await supabase
      .from('categories')
      .update(updateFields)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error al actualizar categoría:', updateError);
      return NextResponse.json({ 
        error: 'Error al actualizar la categoría' 
      }, { status: 500 });
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error en PATCH /api/categories/[id]:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que la categoría pertenece al usuario
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingCategory) {
      return NextResponse.json({ 
        error: 'Categoría no encontrada o no autorizada' 
      }, { status: 404 });
    }

    // Verificar si la categoría está siendo usada
    const { data: incomeUsage } = await supabase
      .from('income')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    const { data: expenseUsage } = await supabase
      .from('expenses')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if ((incomeUsage && incomeUsage.length > 0) || (expenseUsage && expenseUsage.length > 0)) {
      // En lugar de eliminar, desactivar la categoría
      const { data: deactivatedCategory, error: deactivateError } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (deactivateError) {
        console.error('Error al desactivar categoría:', deactivateError);
        return NextResponse.json({ 
          error: 'Error al desactivar la categoría' 
        }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Categoría desactivada (estaba siendo utilizada)',
        category: deactivatedCategory
      });
    }

    // Si no está siendo usada, eliminarla completamente
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error al eliminar categoría:', deleteError);
      return NextResponse.json({ 
        error: 'Error al eliminar la categoría' 
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error en DELETE /api/categories/[id]:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
