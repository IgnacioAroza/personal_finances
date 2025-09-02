import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
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
  request: NextRequest,
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
      .select('id, name, type')
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
    
    // Validar nombre si se está actualizando
    if (name !== undefined) {
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
      updateFields.name = trimmedName;
    }
    
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

    // Verificar duplicados si se está cambiando nombre o tipo
    if (updateFields.name || updateFields.type) {
      const nameToCheck = updateFields.name || existingCategory.name;
      const typeToCheck = updateFields.type || existingCategory.type;
      
      const { data: duplicateCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', nameToCheck)
        .eq('type', typeToCheck)
        .eq('is_active', true)
        .neq('id', id) // Excluir la categoría actual
        .maybeSingle();

      if (duplicateCategory) {
        return NextResponse.json({ 
          error: 'Ya existe una categoría con este nombre para este tipo' 
        }, { status: 409 });
      }
    }

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
      
      // Manejar errores específicos de duplicados a nivel de BD
      if (updateError.code === '23505') {
        return NextResponse.json({ 
          error: 'Ya existe una categoría con este nombre' 
        }, { status: 409 });
      }
      
      return NextResponse.json({ 
        error: 'Error al actualizar la categoría',
        details: updateError.message
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
  request: NextRequest,
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
      .select('id, is_active')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingCategory) {
      return NextResponse.json({ 
        error: 'Categoría no encontrada o no autorizada' 
      }, { status: 404 });
    }

    // Verificar si ya está desactivada
    if (!existingCategory.is_active) {
      return NextResponse.json({ 
        error: 'La categoría ya está desactivada' 
      }, { status: 400 });
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

    const isInUse = (incomeUsage && incomeUsage.length > 0) || (expenseUsage && expenseUsage.length > 0);

    // Siempre desactivar en lugar de eliminar para mantener integridad
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
      message: isInUse 
        ? 'Categoría desactivada (estaba siendo utilizada)' 
        : 'Categoría desactivada exitosamente',
      category: deactivatedCategory,
      wasInUse: isInUse
    });
  } catch (error) {
    console.error('Error en DELETE /api/categories/[id]:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
