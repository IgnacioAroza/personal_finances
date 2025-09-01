drop extension if exists "pg_net";


  create table "public"."categories" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "type" text not null,
    "icon" text not null default '📦'::text,
    "color" text not null default '#6B7280'::text,
    "user_id" uuid,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."categories" enable row level security;


  create table "public"."expenses" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "amount" numeric(12,2) not null,
    "description" text not null,
    "date" date not null,
    "category_id" uuid,
    "notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."expenses" enable row level security;


  create table "public"."income" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "amount" numeric(12,2) not null,
    "description" text not null,
    "date" date not null,
    "category_id" uuid,
    "notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."income" enable row level security;


  create table "public"."users" (
    "id" uuid not null,
    "email" text not null,
    "first_name" text,
    "last_name" text,
    "avatar_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX expenses_pkey ON public.expenses USING btree (id);

CREATE INDEX idx_categories_type ON public.categories USING btree (type);

CREATE INDEX idx_categories_user_id ON public.categories USING btree (user_id);

CREATE INDEX idx_expenses_category_id ON public.expenses USING btree (category_id);

CREATE INDEX idx_expenses_date ON public.expenses USING btree (date);

CREATE INDEX idx_expenses_user_id ON public.expenses USING btree (user_id);

CREATE INDEX idx_income_category_id ON public.income USING btree (category_id);

CREATE INDEX idx_income_date ON public.income USING btree (date);

CREATE INDEX idx_income_user_id ON public.income USING btree (user_id);

CREATE UNIQUE INDEX income_pkey ON public.income USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."expenses" add constraint "expenses_pkey" PRIMARY KEY using index "expenses_pkey";

alter table "public"."income" add constraint "income_pkey" PRIMARY KEY using index "income_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."categories" add constraint "categories_type_check" CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text]))) not valid;

alter table "public"."categories" validate constraint "categories_type_check";

alter table "public"."categories" add constraint "categories_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."categories" validate constraint "categories_user_id_fkey";

alter table "public"."expenses" add constraint "expenses_amount_check" CHECK ((amount > (0)::numeric)) not valid;

alter table "public"."expenses" validate constraint "expenses_amount_check";

alter table "public"."expenses" add constraint "expenses_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL not valid;

alter table "public"."expenses" validate constraint "expenses_category_id_fkey";

alter table "public"."expenses" add constraint "expenses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."expenses" validate constraint "expenses_user_id_fkey";

alter table "public"."income" add constraint "income_amount_check" CHECK ((amount > (0)::numeric)) not valid;

alter table "public"."income" validate constraint "income_amount_check";

alter table "public"."income" add constraint "income_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL not valid;

alter table "public"."income" validate constraint "income_category_id_fkey";

alter table "public"."income" add constraint "income_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."income" validate constraint "income_user_id_fkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_default_categories()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    user_uuid UUID := NEW.id;
BEGIN
  -- Categorías de gastos por defecto
  INSERT INTO public.categories (name, type, icon, color, user_id) VALUES
    ('Alimentación', 'expense', '🍔', '#EF4444', user_uuid),
    ('Transporte', 'expense', '🚗', '#3B82F6', user_uuid),
    ('Entretenimiento', 'expense', '🎬', '#8B5CF6', user_uuid),
    ('Salud', 'expense', '⚕️', '#10B981', user_uuid),
    ('Educación', 'expense', '📚', '#F59E0B', user_uuid),
    ('Hogar', 'expense', '🏠', '#6B7280', user_uuid),
    ('Ropa', 'expense', '👕', '#EC4899', user_uuid),
    ('Otros gastos', 'expense', '💳', '#64748B', user_uuid);
  
  -- Categorías de ingresos por defecto
  INSERT INTO public.categories (name, type, icon, color, user_id) VALUES
    ('Salario', 'income', '💼', '#059669', user_uuid),
    ('Freelance', 'income', '💻', '#0891B2', user_uuid),
    ('Inversiones', 'income', '📈', '#7C3AED', user_uuid),
    ('Otros ingresos', 'income', '💰', '#DC2626', user_uuid);
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."expenses" to "anon";

grant insert on table "public"."expenses" to "anon";

grant references on table "public"."expenses" to "anon";

grant select on table "public"."expenses" to "anon";

grant trigger on table "public"."expenses" to "anon";

grant truncate on table "public"."expenses" to "anon";

grant update on table "public"."expenses" to "anon";

grant delete on table "public"."expenses" to "authenticated";

grant insert on table "public"."expenses" to "authenticated";

grant references on table "public"."expenses" to "authenticated";

grant select on table "public"."expenses" to "authenticated";

grant trigger on table "public"."expenses" to "authenticated";

grant truncate on table "public"."expenses" to "authenticated";

grant update on table "public"."expenses" to "authenticated";

grant delete on table "public"."expenses" to "service_role";

grant insert on table "public"."expenses" to "service_role";

grant references on table "public"."expenses" to "service_role";

grant select on table "public"."expenses" to "service_role";

grant trigger on table "public"."expenses" to "service_role";

grant truncate on table "public"."expenses" to "service_role";

grant update on table "public"."expenses" to "service_role";

grant delete on table "public"."income" to "anon";

grant insert on table "public"."income" to "anon";

grant references on table "public"."income" to "anon";

grant select on table "public"."income" to "anon";

grant trigger on table "public"."income" to "anon";

grant truncate on table "public"."income" to "anon";

grant update on table "public"."income" to "anon";

grant delete on table "public"."income" to "authenticated";

grant insert on table "public"."income" to "authenticated";

grant references on table "public"."income" to "authenticated";

grant select on table "public"."income" to "authenticated";

grant trigger on table "public"."income" to "authenticated";

grant truncate on table "public"."income" to "authenticated";

grant update on table "public"."income" to "authenticated";

grant delete on table "public"."income" to "service_role";

grant insert on table "public"."income" to "service_role";

grant references on table "public"."income" to "service_role";

grant select on table "public"."income" to "service_role";

grant trigger on table "public"."income" to "service_role";

grant truncate on table "public"."income" to "service_role";

grant update on table "public"."income" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "Users can delete their own categories"
  on "public"."categories"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "Users can insert their own categories"
  on "public"."categories"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "Users can update their own categories"
  on "public"."categories"
  as permissive
  for update
  to public
using ((user_id = auth.uid()));



  create policy "Users can view their own categories"
  on "public"."categories"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "Users can delete their own expenses"
  on "public"."expenses"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "Users can insert their own expenses"
  on "public"."expenses"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "Users can update their own expenses"
  on "public"."expenses"
  as permissive
  for update
  to public
using ((user_id = auth.uid()));



  create policy "Users can view their own expenses"
  on "public"."expenses"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "Users can delete their own income"
  on "public"."income"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "Users can insert their own income"
  on "public"."income"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "Users can update their own income"
  on "public"."income"
  as permissive
  for update
  to public
using ((user_id = auth.uid()));



  create policy "Users can view their own income"
  on "public"."income"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "Users can insert their own data"
  on "public"."users"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can update their own data"
  on "public"."users"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can view their own data"
  on "public"."users"
  as permissive
  for select
  to public
using ((auth.uid() = id));


CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_updated_at BEFORE UPDATE ON public.income FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_user_created_add_categories AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION create_default_categories();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


