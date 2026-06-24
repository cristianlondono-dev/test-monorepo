import { expect, test } from "@playwright/test";
import { deleteUserByEmail, uniqueEmail } from "./helpers";

test.describe("Users page", () => {
  test("create, edit, and delete a user", async ({ page }) => {
    const email = uniqueEmail("e2e-user");

    try {
      await page.goto("/users");

      await page.getByRole("button", { name: "Nuevo usuario" }).click();
      await page.getByLabel("Nombre").fill("Ada");
      await page.getByLabel("Apellido").fill("Lovelace");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Teléfono").fill("5550001");
      await page.getByLabel("Indicativo de país").fill("+57");
      await page.getByLabel("Rol").selectOption("admin");
      await page.getByRole("button", { name: "Guardar" }).click();

      let userRow = page.locator("tr").filter({ hasText: email });
      await expect(userRow).toBeVisible();
      await expect(userRow).toContainText("Ada Lovelace");
      await expect(userRow).toContainText("admin");

      await userRow.getByRole("button", { name: "Editar" }).click();
      await page.getByLabel("Nombre").fill("Ada Updated");
      await page.getByRole("button", { name: "Guardar" }).click();

      userRow = page.locator("tr").filter({ hasText: email });
      await expect(userRow).toContainText("Ada Updated Lovelace");

      await userRow.getByRole("button", { name: "Eliminar" }).click();
      await expect(page.locator("tr").filter({ hasText: email })).toHaveCount(0);
    } finally {
      await deleteUserByEmail(email);
    }
  });

  // See findings.md, issue #1: the create-drawer form keeps the React key
  // "create" across separate create sessions (UsersView.tsx), so UserForm never
  // remounts and its fields don't reset to empty between two consecutive creates.
  test.fixme(
    "create drawer resets to empty fields on a second consecutive open",
    async ({ page }) => {
      const email = uniqueEmail("e2e-user-reset");
      try {
        await page.goto("/users");

        await page.getByRole("button", { name: "Nuevo usuario" }).click();
        await page.getByLabel("Nombre").fill("First");
        await page.getByLabel("Apellido").fill("Entry");
        await page.getByLabel("Email").fill(email);
        await page.getByLabel("Teléfono").fill("5550001");
        await page.getByLabel("Indicativo de país").fill("+57");
        await page.getByRole("button", { name: "Guardar" }).click();
        await expect(page.locator("tr").filter({ hasText: email })).toBeVisible();

        await page.getByRole("button", { name: "Nuevo usuario" }).click();
        await expect(page.getByLabel("Nombre")).toHaveValue("");
        await expect(page.getByLabel("Email")).toHaveValue("");
      } finally {
        await deleteUserByEmail(email);
      }
    },
  );
});
