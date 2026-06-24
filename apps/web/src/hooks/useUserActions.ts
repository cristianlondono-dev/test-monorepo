"use client";

import { useRouter } from "next/navigation";
import type { CreateUserDto, UpdateUserDto } from "@repo/types";
import { createUser, deleteUser, updateUser } from "../lib/api";

export function useUserActions() {
  const router = useRouter();

  async function saveUser(dto: CreateUserDto | UpdateUserDto, userId?: string): Promise<void> {
    if (userId) {
      await updateUser(userId, dto);
    } else {
      await createUser(dto as CreateUserDto);
    }
    router.refresh();
  }

  async function removeUser(id: string): Promise<void> {
    await deleteUser(id);
    router.refresh();
  }

  return { saveUser, removeUser };
}
