import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    // Obtener el ingreso específico del usuario
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
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (selectError) {
      if (selectError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Ingreso no encontrado' }, { status: 404 });
      }
      console.error('Error al obtener ingreso:', selectError);
      return NextResponse.json({ 
        error: 'Error al obtener el ingreso' 
      }, { status: 500 });
    }

    return NextResponse.json(income);
  } catch (error) {
    console.error('Error en GET /api/income/[id]:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { amount, description, date, category_id, notes } = body;

    // Validar que el ingreso pertenece al usuario
    const { data: existingIncome } = await supabase
      .from('income')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingIncome) {
      return NextResponse.json({ 
        error: 'Ingreso no encontrado o no autorizado' 
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

    // Actualizar el ingreso
    const { data: updatedIncome, error: updateError } = await supabase
      .from('income')
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
      console.error('Error al actualizar ingreso:', updateError);
      return NextResponse.json({ 
        error: 'Error al actualizar el ingreso' 
      }, { status: 500 });
    }

    return NextResponse.json(updatedIncome);
  } catch (error) {
    console.error('Error en PATCH /api/income/[id]:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    // Verificar que el ingreso pertenece al usuario antes de eliminarlo
    const { data: existingIncome } = await supabase
      .from('income')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingIncome) {
      return NextResponse.json({ 
        error: 'Ingreso no encontrado o no autorizado' 
      }, { status: 404 });
    }

    // Eliminar el ingreso
    const { error: deleteError } = await supabase
      .from('income')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error al eliminar ingreso:', deleteError);
      return NextResponse.json({ 
        error: 'Error al eliminar el ingreso' 
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'Ingreso eliminado exitosamente' });
  } catch (error) {
    console.error('Error en DELETE /api/income/[id]:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
