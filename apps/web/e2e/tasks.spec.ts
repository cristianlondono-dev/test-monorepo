import { expect, test } from "@playwright/test";
import { UserRole } from "@repo/types";
import {
  createTestUser,
  deleteTaskByName,
  deleteTestUser,
  uniqueEmail,
} from "./helpers";

test.describe("Tasks page", () => {
  test("create with multiple assignees, toggle status, edit, and delete", async ({ page }) => {
    const userA = await createTestUser({
      name: "Marie",
      lastName: "Curie",
      email: uniqueEmail("e2e-task-a"),
      phone: "5550001",
      indicativeCountry: "+57",
      role: UserRole.MEMBER,
    });
    const userB = await createTestUser({
      name: "Niels",
      lastName: "Bohr",
      email: uniqueEmail("e2e-task-b"),
      phone: "5550002",
      indicativeCountry: "+45",
      role: UserRole.MEMBER,
    });
    const taskName = `E2E task ${Date.now()}`;

    try {
      await page.goto("/tasks");

      await page.getByRole("button", { name: "Nueva tarea" }).click();
      await page.getByLabel("Nombre").fill(taskName);
      await page.getByLabel("Descripción").fill("Created by e2e test");
      await page.getByLabel("Fecha de cierre").fill("2026-12-31");
      await page.getByLabel(`${userA.name} ${userA.lastName}`).check();
      await page.getByLabel(`${userB.name} ${userB.lastName}`).check();
      await page.getByRole("button", { name: "Guardar" }).click();

      const taskItem = page.locator("li").filter({ hasText: taskName });
      await expect(taskItem).toBeVisible();
      await expect(taskItem).toContainText(`${userA.name} ${userA.lastName}`);
      await expect(taskItem).toContainText(`${userB.name} ${userB.lastName}`);

      const taskTitle = taskItem.locator("p").first();
      const checkbox = taskItem.getByRole("checkbox", { name: "Marcar como completada" });

      // The checkbox's checked state is driven entirely by the `task` prop (no local/optimistic
      // state), so `.check()`/`.uncheck()`'s own immediate verification is too strict here —
      // click and assert separately so the assertion's normal auto-retry covers the round trip.
      await checkbox.click();
      await expect(checkbox).toBeChecked();
      await expect(taskTitle).toHaveClass(/line-through/);

      await checkbox.click();
      await expect(checkbox).not.toBeChecked();
      await expect(taskTitle).not.toHaveClass(/line-through/);

      await taskItem.getByRole("button", { name: "Editar" }).click();
      await page.getByLabel("Descripción").fill("Updated by e2e test");
      await page.getByRole("button", { name: "Guardar" }).click();

      await expect(taskItem).toContainText("Updated by e2e test");

      await taskItem.getByRole("button", { name: "Eliminar" }).click();
      await expect(page.locator("li").filter({ hasText: taskName })).toHaveCount(0);
    } finally {
      await deleteTaskByName(taskName);
      await deleteTestUser(userA.id);
      await deleteTestUser(userB.id);
    }
  });

  // See findings.md, issue #1: same root cause as the users.spec.ts fixme — the
  // create-drawer form keeps the React key "create" across separate create sessions
  // (TasksView.tsx), so TaskForm never remounts. Worse here: the assignee checkbox
  // also stays checked, so a new task can be silently pre-assigned to a stale user.
  test.fixme(
    "create drawer resets to empty fields and unchecked assignees on a second open",
    async ({ page }) => {
      const assignee = await createTestUser({
        name: "Stale",
        lastName: "Assignee",
        email: uniqueEmail("e2e-task-reset"),
        phone: "5550000",
        indicativeCountry: "+57",
        role: UserRole.MEMBER,
      });
      const firstTaskName = `Reset task ${Date.now()}`;
      try {
        await page.goto("/tasks");

        await page.getByRole("button", { name: "Nueva tarea" }).click();
        await page.getByLabel("Nombre").fill(firstTaskName);
        await page.getByLabel("Descripción").fill("first description");
        await page.getByLabel("Fecha de cierre").fill("2026-12-31");
        await page.getByLabel(`${assignee.name} ${assignee.lastName}`).check();
        await page.getByRole("button", { name: "Guardar" }).click();
        await expect(page.locator("li").filter({ hasText: firstTaskName })).toBeVisible();

        await page.getByRole("button", { name: "Nueva tarea" }).click();
        await expect(page.getByLabel("Nombre")).toHaveValue("");
        await expect(page.getByLabel("Descripción")).toHaveValue("");
        await expect(page.getByLabel(`${assignee.name} ${assignee.lastName}`)).not.toBeChecked();
      } finally {
        await deleteTaskByName(firstTaskName);
        await deleteTestUser(assignee.id);
      }
    },
  );
});
