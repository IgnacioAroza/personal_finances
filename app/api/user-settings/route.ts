import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isValidCurrency } from '@/lib/utils/currency';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener configuración del usuario
    const { data: settings, error: selectError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error al obtener configuración:', selectError);
      return NextResponse.json({ 
        error: 'Error al obtener la configuración' 
      }, { status: 500 });
    }

    // Si no existe configuración, crear una por defecto
    if (!settings) {
      const { data: newSettings, error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          default_currency: 'ARS',
          active_currencies: ['ARS', 'USD', 'EUR']
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error al crear configuración:', insertError);
        return NextResponse.json({ 
          error: 'Error al crear la configuración' 
        }, { status: 500 });
      }

      return NextResponse.json(newSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error en GET /api/user-settings:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { default_currency, active_currencies } = body;

    // Validar default_currency
    if (default_currency && !isValidCurrency(default_currency)) {
      return NextResponse.json({ 
        error: 'Moneda por defecto inválida. Use ARS, USD o EUR' 
      }, { status: 400 });
    }

    // Validar active_currencies
    if (active_currencies && Array.isArray(active_currencies)) {
      for (const currency of active_currencies) {
        if (!isValidCurrency(currency)) {
          return NextResponse.json({ 
            error: 'Moneda activa inválida. Use ARS, USD o EUR' 
          }, { status: 400 });
        }
      }
    }

    // Actualizar configuración
    const { data: updatedSettings, error: updateError } = await supabase
      .from('user_settings')
      .update({
        ...(default_currency && { default_currency }),
        ...(active_currencies && { active_currencies })
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error al actualizar configuración:', updateError);
      return NextResponse.json({ 
        error: 'Error al actualizar la configuración' 
      }, { status: 500 });
    }

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error en PUT /api/user-settings:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}