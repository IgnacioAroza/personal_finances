import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Primero obtener el id interno del usuario
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (userError || !user) {
      console.error("Error al encontrar usuario:", userError);
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { data: expenses, error } = await supabase
      .from("expenses")
      .select(`
        *,
        categories (
          id,
          name,
          icon,
          color
        )
      `)
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error al obtener gastos:", error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("Error al obtener gastos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, description, category_id, date } = body;

    // Validar datos requeridos
    if (!amount || !description || !category_id) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe en la tabla users
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (userError || !user) {
      console.error("Error al encontrar usuario:", userError);
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { data: expense, error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        amount: parseFloat(amount),
        description,
        category_id,
        date: date || new Date().toISOString().split('T')[0],
      })
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

    if (error) {
      console.error("Error al crear gasto:", error);
      return NextResponse.json({ error: "Error al crear gasto" }, { status: 500 });
    }

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error al crear gasto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
