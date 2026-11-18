import { test, expect, Page } from "@playwright/test";

const email = process.env.E2E_EMAIL ?? "";
const password = process.env.E2E_PASSWORD ?? "";

test.skip(
  !email || !password,
  "Configura E2E_EMAIL y E2E_PASSWORD para ejecutar las pruebas autenticadas."
);

// INICIO DE SESIÓN
async function login(page: Page) {
  await page.goto("/auth/login");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/protected$/, {
    timeout: 30000,
  });

  await expect(
    page.getByRole("heading", {
      name: "¡Bienvenido a PrestaFácil!",
    })
  ).toBeVisible({ timeout: 30000 });
}

// GENERAR NOMBRES ÚNICOS
function uniqueName(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

// REGISTRAR OBJETO
async function createObject(page: Page, name: string) {
  await page.goto("/protected/objects/new");

  await page.getByLabel(/nombre del objeto/i).fill(name);

  await page.getByLabel("Categoría").selectOption("Tecnología");

  await page.getByLabel(/descripción/i).fill(
    "Objeto de prueba para validar el funcionamiento de PrestaFácil."
  );

  await page.getByRole("button", {
    name: /guardar objeto/i,
  }).click();

  await expect(page).toHaveURL(/\/protected\/objects$/);

  await expect(
    page.getByRole("heading", { name })
  ).toBeVisible();
}

// REGISTRAR PRÉSTAMO
async function createLoan(
  page: Page,
  itemName: string,
  borrowerName: string
) {
  await page.goto("/protected/loans/new");

  const itemSelect = page.locator("select").first();

  await expect(itemSelect).toBeVisible();

  // Buscar el objeto por su nombre
  const itemOption = itemSelect.locator("option").filter({
    hasText: itemName,
  });

  await expect(itemOption).toHaveCount(1, {
    timeout: 30000,
  });

  const itemId = await itemOption.getAttribute("value");

  if (!itemId) {
    throw new Error(`No se encontró el ID del objeto: ${itemName}`);
  }

  await itemSelect.selectOption(itemId);

  // Nombre del prestatario
  await page.getByPlaceholder("Nombre completo").fill(borrowerName);

  // Contacto
  await page
    .getByPlaceholder("Teléfono o correo electrónico")
    .fill("prueba@prestafacil.com");

  // Fecha de devolución
  await page.locator('input[type="date"]').fill("2099-12-31");

  // Observaciones
  await page
    .getByPlaceholder(/información adicional del préstamo/i)
    .fill("Préstamo generado automáticamente mediante Playwright.");

  // Verificar los campos
  await expect(itemSelect).toHaveValue(itemId);

  await expect(
    page.getByPlaceholder("Nombre completo")
  ).toHaveValue(borrowerName);

  await expect(
    page.locator('input[type="date"]')
  ).toHaveValue("2099-12-31");

  await expect(
    page.getByPlaceholder("Teléfono o correo electrónico")
  ).toHaveValue("prueba@prestafacil.com");

  // Registrar préstamo
  await page.getByRole("button", {
    name: "Registrar préstamo",
  }).click();

  // Confirmar redirección
  await expect(page).toHaveURL(/\/protected\/loans$/, {
    timeout: 30000,
  });

  // Identificar la tarjeta del préstamo creado
  const loanCard = page.locator("article").filter({
    has: page.getByRole("heading", { name: itemName }),
  });

  await expect(loanCard).toHaveCount(1);

  // Verificar objeto
  await expect(
    loanCard.getByRole("heading", { name: itemName })
  ).toBeVisible();

  // Verificar prestatario
  await expect(
    loanCard.getByText(`Prestado a: ${borrowerName}`, {
      exact: true,
    })
  ).toBeVisible();

  return loanCard;
}

// E2E-01: INICIAR SESIÓN
test("E2E-01: permite iniciar sesión y entrar al dashboard", async ({ page }) => {
  await login(page);

  await expect(page).toHaveURL(/\/protected$/);

  await expect(page.getByText("Resumen general")).toBeVisible();
});

// E2E-02: PROTEGER DASHBOARD
test("E2E-02: protege el dashboard cuando no hay sesión", async ({ page }) => {
  await page.goto("/protected");

  await expect(page).toHaveURL(/\/auth\/login/);

  await expect(
    page.getByRole("button", { name: "Login" })
  ).toBeVisible();
});

// E2E-03: REGISTRAR OBJETO
test("E2E-03: registra un objeto y lo muestra en el inventario", async ({ page }) => {
  await login(page);

  const itemName = uniqueName("E2E-Portatil");

  await createObject(page, itemName);
});

// E2E-04: CREAR Y CONSULTAR PRÉSTAMO
test("E2E-04: registra un objeto, crea un préstamo y lo consulta", async ({ page }) => {
  await login(page);

  const itemName = uniqueName("E2E-Prestamo");
  const borrowerName = uniqueName("Usuario-Prueba");

  await createObject(page, itemName);

  const loanCard = await createLoan(page, itemName, borrowerName);

  // Verificar estado únicamente en la tarjeta del préstamo creado
  await expect(
    loanCard.getByText("Activo", { exact: true })
  ).toBeVisible();
});

// E2E-05: REGISTRAR DEVOLUCIÓN
test("E2E-05: registra un préstamo y confirma su devolución", async ({ page }) => {
  await login(page);

  const itemName = uniqueName("E2E-Devolucion");
  const borrowerName = uniqueName("Prestatario-Prueba");

  await createObject(page, itemName);

  const loanCard = await createLoan(page, itemName, borrowerName);

  // Confirmar que el préstamo está activo
  await expect(
    loanCard.getByText("Activo", { exact: true })
  ).toBeVisible();

  // Aceptar el cuadro de confirmación
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });

  // Registrar devolución únicamente del préstamo creado
  await loanCard.getByRole("button", {
    name: /registrar devolución/i,
  }).click();

  // Confirmar mensaje de devolución
  await expect(
    page.getByText(`La devolución de "${itemName}" fue registrada.`, {
      exact: true,
    })
  ).toBeVisible({ timeout: 30000 });

  // Verificar estado devuelto en la tarjeta correspondiente
  await expect(
    loanCard.getByText("Devuelto", { exact: true })
  ).toBeVisible();
});
