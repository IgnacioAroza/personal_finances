import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener datos del usuario desde nuestra tabla
    const { data: userData, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (selectError) {
      if (selectError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }
      console.error('Error al obtener usuario:', selectError);
      return NextResponse.json({ 
        error: 'Error al obtener los datos del usuario' 
      }, { status: 500 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error en GET /api/users:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingUser) {
      return NextResponse.json({ 
        message: 'Usuario ya existe',
        user: existingUser 
      });
    }

    // Crear el usuario en nuestra tabla
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error al crear usuario:', insertError);
      return NextResponse.json({ 
        error: 'Error al crear el usuario' 
      }, { status: 500 });
    }

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error en POST /api/users:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { first_name, last_name } = body;

    // Actualizar datos del usuario
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        first_name,
        last_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error al actualizar usuario:', updateError);
      return NextResponse.json({ 
        error: 'Error al actualizar el usuario' 
      }, { status: 500 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error en PATCH /api/users:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
