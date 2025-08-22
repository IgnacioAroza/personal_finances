import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { defaultCategories } from '@/lib/utils';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (existingUser) {
      return NextResponse.json({ message: 'Usuario ya existe', user: existingUser });
    }

    // Crear nuevo usuario
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        clerk_user_id: userId,
        email: '', // Se puede obtener de Clerk si es necesario
        first_name: '',
        last_name: ''
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creando usuario:', userError);
      return NextResponse.json({ error: 'Error creando usuario' }, { status: 500 });
    }

    // Crear categorías predeterminadas
    const categories = [
      ...defaultCategories.income.map(cat => ({
        ...cat,
        type: 'income' as const,
        user_id: newUser.id
      })),
      ...defaultCategories.expense.map(cat => ({
        ...cat,
        type: 'expense' as const,
        user_id: newUser.id
      }))
    ];

    const { error: categoriesError } = await supabase
      .from('categories')
      .insert(categories);

    if (categoriesError) {
      console.error('Error creando categorías:', categoriesError);
      // No retornar error aquí, el usuario se creó correctamente
    }

    return NextResponse.json({ 
      message: 'Usuario creado exitosamente', 
      user: newUser 
    });

  } catch (error) {
    console.error('Error en POST /api/users:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const supabase = createServerClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (error) {
      console.error('Error obteniendo usuario:', error);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Error en GET /api/users:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
