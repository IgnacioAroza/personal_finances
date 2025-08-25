import { auth, currentUser } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Endpoint para actualizar usuarios existentes con datos reales de Clerk
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

    const supabase = createServerClient();

    console.log('Actualizando usuario existente con datos reales de Clerk:', {
      clerk_user_id: userId,
      email: clerkUser.primaryEmailAddress?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName
    });

    // Actualizar el usuario existente con datos reales
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        first_name: clerkUser.firstName || '',
        last_name: clerkUser.lastName || '',
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error actualizando usuario:', updateError);
      return NextResponse.json({ 
        error: 'Error actualizando usuario',
        details: updateError 
      }, { status: 500 });
    }

    console.log('Usuario actualizado exitosamente:', updatedUser);

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser,
      clerk_data: {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName
      }
    });

  } catch (error) {
    console.error('Error en update usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
