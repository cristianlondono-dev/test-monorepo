"use client";

import { useState, type FormEvent } from "react";
import { UserRole, type CreateUserDto, type User } from "@repo/types";

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.MANAGER]: "Manager",
  [UserRole.MEMBER]: "Member",
};

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
const selectClass = `${inputClass} select-arrow appearance-none bg-no-repeat bg-[length:16px] bg-[right_0.75rem_center] pr-9`;
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

interface UserFormProps {
  user?: User;
  onSubmit: (dto: CreateUserDto) => Promise<void>;
}

export function UserForm({ user, onSubmit }: UserFormProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [indicativeCountry, setIndicativeCountry] = useState(user?.indicativeCountry ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? UserRole.MEMBER);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, lastName, email, phone, indicativeCountry, role });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el usuario");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Nombre</span>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Apellido</span>
        <input
          className={inputClass}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Email</span>
        <input
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Teléfono</span>
        <input
          className={inputClass}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Indicativo de país</span>
        <input
          className={inputClass}
          placeholder="+57"
          value={indicativeCountry}
          onChange={(e) => setIndicativeCountry(e.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Rol</span>
        <select
          className={selectClass}
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          {Object.values(UserRole).map((value) => (
            <option key={value} value={value}>
              {ROLE_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
      >
        {submitting ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
