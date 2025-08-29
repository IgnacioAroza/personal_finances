import { createClient } from '@/lib/supabase/server';
import { NextResponse, NextRequest } from 'next/server';

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

    // Obtener el gasto específico del usuario
    const { data: expense, error: selectError } = await supabase
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
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (selectError) {
      if (selectError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 });
      }
      console.error('Error al obtener gasto:', selectError);
      return NextResponse.json({ 
        error: 'Error al obtener el gasto' 
      }, { status: 500 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error en GET /api/expenses/[id]:', error);
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
    const { amount, description, date, category_id, notes } = body;

    // Validar que el gasto pertenece al usuario
    const { data: existingExpense } = await supabase
      .from('expenses')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingExpense) {
      return NextResponse.json({ 
        error: 'Gasto no encontrado o no autorizado' 
      }, { status: 404 });
    }

    // Preparar campos para actualizar
    const updateFields: {
      updated_at: string;
      amount?: number;
      description?: string;
      date?: string;
      category_id?: string;
      notes?: string | null;
    } = { updated_at: new Date().toISOString() };
    
    if (amount !== undefined) updateFields.amount = parseFloat(amount);
    if (description !== undefined) updateFields.description = description;
    if (date !== undefined) updateFields.date = date;
    if (category_id !== undefined) updateFields.category_id = category_id;
    if (notes !== undefined) updateFields.notes = notes;

    // Actualizar el gasto
    const { data: updatedExpense, error: updateError } = await supabase
      .from('expenses')
      .update(updateFields)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color
        )
      `)
      .single();

    if (updateError) {
      console.error('Error al actualizar gasto:', updateError);
      return NextResponse.json({ 
        error: 'Error al actualizar el gasto' 
      }, { status: 500 });
    }

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error('Error en PATCH /api/expenses/[id]:', error);
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

    // Verificar que el gasto pertenece al usuario antes de eliminarlo
    const { data: existingExpense } = await supabase
      .from('expenses')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingExpense) {
      return NextResponse.json({ 
        error: 'Gasto no encontrado o no autorizado' 
      }, { status: 404 });
    }

    // Eliminar el gasto
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error al eliminar gasto:', deleteError);
      return NextResponse.json({ 
        error: 'Error al eliminar el gasto' 
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'Gasto eliminado exitosamente' });
  } catch (error) {
    console.error('Error en DELETE /api/expenses/[id]:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
