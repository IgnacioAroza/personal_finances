-- Make description nullable in income and expenses
alter table "public"."income" alter column "description" drop not null;
alter table "public"."expenses" alter column "description" drop not null;

-- Ensure empty string when description is omitted (NULL)
create or replace function public.set_empty_description()
returns trigger as $$
begin
  if NEW.description is null then
    NEW.description := '';
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Drop triggers if they already exist (idempotent for resets)
drop trigger if exists income_set_empty_description on public.income;
create trigger income_set_empty_description
  before insert or update on public.income
  for each row execute function public.set_empty_description();

drop trigger if exists expenses_set_empty_description on public.expenses;
create trigger expenses_set_empty_description
  before insert or update on public.expenses
  for each row execute function public.set_empty_description();
