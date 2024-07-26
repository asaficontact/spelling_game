-- Create profiles table with unique constraints and primary key
create table public.profiles(
    id uuid unique references auth.users on delete cascade,
    user_name text unique not null,
    password text not null,
    updated_at timestamp with time zone default now() not null,
    created_at timestamp with time zone default now() not null,
    primary key (id)
);

-- Enable row level security on profiles table
alter table public.profiles enable row level security;

-- Create policies for row level security
create policy "Users can view own profile" on profiles
    for select to authenticated
        using (auth.uid() = id);

create policy "Users can update own profile" on profiles
    for update to authenticated
        using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
    for insert to authenticated
        with check (auth.uid() = id);

create policy "Users can delete own profile" on profiles
    for delete to authenticated
        using (auth.uid() = id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
    returns trigger
    as $$
begin
    insert into public.profiles(id, user_name, password)
        values(new.id, new.raw_user_meta_data ->> 'user_name', new.raw_user_meta_data ->> 'password');
    return new;
end;
$$
language plpgsql
security definer;

-- Trigger to create new profile after user creation
create trigger on_auth_user_created
    after insert on auth.users for each row
    execute procedure public.handle_new_user();

-- Function to handle user deletion
create or replace function public.handle_delete_user()
    returns trigger
    as $$
begin
    delete from public.profiles
    where id = old.id;
    return old;
end;
$$
language plpgsql
security definer;

-- Trigger to delete profile after user deletion
create trigger on_auth_user_deleted
    after delete on auth.users for each row
    execute procedure public.handle_delete_user();

-- Create function to update the 'updated_at' timestamp
create or replace function update_modified_column()
    returns trigger
    as $$
begin
    new.updated_at = now();
    return NEW;
end;
$$
language plpgsql;

-- Create trigger to automatically update 'updated_at' on profile changes
create trigger update_profiles_modtime
    before update on public.profiles for each row
    execute function update_modified_column();

