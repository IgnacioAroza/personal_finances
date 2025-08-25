import { auth, currentUser } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Endpoint para debugging - verificar estado del usuario
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'No autorizado',
        authenticated: false 
      }, { status: 401 });
    }

    const supabase = createServerClient();

    // Verificar si el usuario existe
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({
        authenticated: true,
        clerk_user_id: userId,
        user_exists_in_db: false,
        error: error?.message || 'Usuario no encontrado en la base de datos'
      });
    }

    return NextResponse.json({
      authenticated: true,
      clerk_user_id: userId,
      user_exists_in_db: true,
      user: user
    });

  } catch (error) {
    console.error('Error en debug endpoint:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// Endpoint para forzar la creación del usuario
export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener información completa del usuario de Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'No se pudo obtener información del usuario' }, { status: 400 });
    }

    console.log('FORZANDO creación de usuario para:', userId);
    console.log('Datos de Clerk:', {
      email: clerkUser.primaryEmailAddress?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName
    });

    const supabase = createServerClient();

    // Intentar crear el usuario directamente con datos reales
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .upsert({
        clerk_user_id: userId,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        first_name: clerkUser.firstName || '',
        last_name: clerkUser.lastName || ''
      }, { 
        onConflict: 'clerk_user_id'
      })
      .select()
      .single();

    if (userError) {
      console.error('Error forzando creación de usuario:', userError);
      return NextResponse.json({ 
        error: 'Error creando usuario',
        details: userError 
      }, { status: 500 });
    }

    console.log('Usuario forzado creado/actualizado:', newUser);

    return NextResponse.json({
      success: true,
      message: 'Usuario creado/actualizado exitosamente',
      user: newUser
    });

  } catch (error) {
    console.error('Error en POST debug:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
