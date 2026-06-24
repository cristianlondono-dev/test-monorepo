"use client";

import { useState } from "react";
import type { CreateUserDto, User } from "@repo/types";
import { useUserActions } from "../hooks/useUserActions";
import { Drawer } from "./Drawer";
import { UserForm } from "./UserForm";
import { TrashIcon } from "./TrashIcon";

interface UsersViewProps {
  users: User[];
}

export function UsersView({ users }: UsersViewProps) {
  const { saveUser, removeUser } = useUserActions();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  function openCreate() {
    setEditingUser(null);
    setDrawerOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setDrawerOpen(true);
  }

  async function handleSubmit(dto: CreateUserDto) {
    await saveUser(dto, editingUser?.id);
    setDrawerOpen(false);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Usuarios</h1>
        <button
          onClick={openCreate}
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"
        >
          Nuevo usuario
        </button>
      </div>

      <table className="mt-6 w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
            <th className="py-2 pr-4">Nombre</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Teléfono</th>
            <th className="py-2 pr-4">Rol</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2 pr-4">
                {user.name} {user.lastName}
              </td>
              <td className="py-2 pr-4">{user.email}</td>
              <td className="py-2 pr-4">
                {user.indicativeCountry} {user.phone}
              </td>
              <td className="py-2 pr-4">{user.role}</td>
              <td className="py-2 text-right whitespace-nowrap">
                <button
                  onClick={() => openEdit(user)}
                  className="mr-3 text-sm text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  Editar
                </button>
                <button
                  onClick={() => removeUser(user.id)}
                  aria-label="Eliminar"
                  className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                >
                  <TrashIcon />
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-zinc-500">
                No hay usuarios todavía.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingUser ? "Editar usuario" : "Nuevo usuario"}
      >
        <UserForm
          key={editingUser?.id ?? "create"}
          user={editingUser ?? undefined}
          onSubmit={handleSubmit}
        />
      </Drawer>
    </div>
  );
}
