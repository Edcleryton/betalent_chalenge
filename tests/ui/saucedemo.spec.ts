import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CartPage } from './pages/CartPage';
import AxeBuilder from '@axe-core/playwright';

const UI_URL      = process.env.UI_URL as string;
const UI_PASSWORD = process.env.UI_PASSWORD as string;

test.describe('Sauce Demo - Login Tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('UI-01: should login with standard_user', async ({ page }) => {
    await loginPage.login('standard_user', UI_PASSWORD);
    await expect(page).toHaveURL(/inventory.html/);
  });

  test('UI-02: should show error for locked_out_user', async () => {
    await loginPage.login('locked_out_user', UI_PASSWORD);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out.');
  });

  test('UI-09: should login with problem_user and reach inventory', async ({ page }) => {
    await loginPage.login('problem_user', UI_PASSWORD);
    await expect(page).toHaveURL(/inventory.html/);
  });

  test('UI-10: should login with performance_glitch_user (slow login)', async ({ page }) => {
    await loginPage.login('performance_glitch_user', UI_PASSWORD);
    await expect(page).toHaveURL(/inventory.html/, { timeout: 15000 });
  });

  test('UI-12: error_user - login succeeds but cart interactions produce errors', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await loginPage.login('error_user', UI_PASSWORD);
    await expect(page).toHaveURL(/inventory.html/);

    await productsPage.addItemToCart(0);
    const errorBanner = page.locator('[data-test="error"]');
    const badgeVisible = await productsPage.cartBadge.isVisible();
    const errorVisible = await errorBanner.isVisible();
    expect(badgeVisible || errorVisible).toBeTruthy();
  });

  test('UI-13: visual_user - login succeeds and inventory loads with visual defects', async ({ page }) => {
    await loginPage.login('visual_user', UI_PASSWORD);
    await expect(page).toHaveURL(/inventory.html/);

    const images = page.locator('.inventory_item img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    const srcs = await images.evaluateAll((imgs: HTMLImageElement[]) =>
      imgs.map(img => img.getAttribute('src'))
    );
    const uniqueSrcs = new Set(srcs);
    expect(uniqueSrcs.size, `[BUG-VU-01] visual_user: ${count} products but only ${uniqueSrcs.size} unique image(s) — visual defect`).toBe(count);
  });
});

test.describe('Sauce Demo - Authenticated Flow', () => {
  let productsPage: ProductsPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    checkoutPage = new CheckoutPage(page);
    await page.goto(`${UI_URL}/inventory.html`);
  });

  test.afterEach(async ({ page }) => {
    await page.goto(`${UI_URL}/inventory.html`);
  });

  test('UI-03a: should sort products by price (low to high)', async () => {
    await productsPage.sortProducts('lohi');
    const prices = await productsPage.page.locator('.inventory_item_price').allInnerTexts();
    const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
    const sortedPrices = [...numericPrices].sort((a, b) => a - b);
    expect(numericPrices).toEqual(sortedPrices);
  });

  test('UI-03b: should sort products by price (high to low)', async () => {
    await productsPage.sortProducts('hilo');
    const prices = await productsPage.page.locator('.inventory_item_price').allInnerTexts();
    const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
    const sortedPrices = [...numericPrices].sort((a, b) => b - a);
    expect(numericPrices).toEqual(sortedPrices);
  });

  test('UI-03c: should sort products by name (A to Z)', async () => {
    await productsPage.sortProducts('az');
    const names = await productsPage.page.locator('.inventory_item_name').allInnerTexts();
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sortedNames);
  });

  test('UI-03d: should sort products by name (Z to A)', async () => {
    await productsPage.sortProducts('za');
    const names = await productsPage.page.locator('.inventory_item_name').allInnerTexts();
    const sortedNames = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sortedNames);
  });

  test('UI-04: should complete a full purchase flow', async ({ page }) => {
    await productsPage.addItemToCart(0);
    await expect(productsPage.cartBadge).toHaveText('1');
    await productsPage.cartButton.click();
    await expect(page).toHaveURL(/cart.html/);
    await checkoutPage.checkoutButton.click();
    await checkoutPage.fillInformation('John', 'Doe', '12345');
    await checkoutPage.finishButton.click();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('UI-05: should remove item from cart', async () => {
    await productsPage.addItemToCart(0);
    await expect(productsPage.cartBadge).toHaveText('1');
    await productsPage.removeItemFromCart(0);
    await expect(productsPage.cartBadge).not.toBeVisible();
  });

  test('UI-06: should logout successfully', async ({ page }) => {
    await productsPage.logout();
    await expect(page).toHaveURL(`${UI_URL}/`);
  });

  test('UI-11: should navigate between key pages', async ({ page }) => {
    await page.locator('.inventory_item_name').first().click();
    await expect(page).toHaveURL(/inventory-item.html/);

    await page.getByTestId('back-to-products').click();
    await expect(page).toHaveURL(/inventory.html/);

    await productsPage.addItemToCart(0);
    await productsPage.cartButton.click();
    await expect(page).toHaveURL(/cart.html/);

    await page.getByTestId('continue-shopping').click();
    await expect(page).toHaveURL(/inventory.html/);
  });

  test('UI-07/08: should check for accessibility violations on inventory page', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, `UI-07/08: ${results.violations.length} accessibility violation(s) on inventory page`).toEqual([]);
  });
});

test.describe('Sauce Demo - Login Validation', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('UI-14: should show error for invalid credentials', async () => {
    await loginPage.login('standard_user', 'wrong_password');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      'Username and password do not match any user in this service'
    );
  });

  test('UI-15: should show error when submitting login with empty fields', async () => {
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('UI-18: should check for accessibility violations on login page', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, `UI-18: ${results.violations.length} accessibility violation(s) on login page`).toEqual([]);
  });
});

test.describe('Sauce Demo - Cart & Checkout Validation', () => {
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    cartPage     = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    await page.goto(`${UI_URL}/inventory.html`);
  });

  test.afterEach(async ({ page }) => {
    await page.goto(`${UI_URL}/inventory.html`);
  });

  test('UI-16: should show validation error on checkout with empty fields', async ({ page }) => {
    await productsPage.addItemToCart(0);
    await productsPage.cartButton.click();
    await expect(page).toHaveURL(/cart.html/);
    await checkoutPage.checkoutButton.click();
    await expect(page).toHaveURL(/checkout-step-one.html/);
    await checkoutPage.continueButton.click();
    const errorMessage = page.getByTestId('error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('First Name is required');
  });

  test('UI-17: should add multiple items to cart and verify subtotal', async ({ page }) => {
    await productsPage.addItemToCart(0);
    await productsPage.addItemToCart(1);
    await expect(productsPage.cartBadge).toHaveText('2');
    await productsPage.cartButton.click();
    await expect(page).toHaveURL(/cart.html/);

    const itemCount = await cartPage.getItemCount();
    expect(itemCount).toBe(2);

    const price0 = parseFloat((await cartPage.itemPrice(0).innerText()).replace('$', ''));
    const price1 = parseFloat((await cartPage.itemPrice(1).innerText()).replace('$', ''));

    await cartPage.checkoutButton.click();
    await checkoutPage.fillInformation('Test', 'User', '00000');
    await expect(page).toHaveURL(/checkout-step-two.html/);

    const subtotalText = await page.getByTestId('subtotal-label').innerText();
    const subtotal = parseFloat(subtotalText.match(/\$([0-9.]+)/)![1]);
    expect(subtotal).toBeCloseTo(price0 + price1, 2);
  });

  test('UI-19: should check for accessibility violations on cart page', async ({ page }) => {
    await productsPage.addItemToCart(0);
    await productsPage.cartButton.click();
    await expect(page).toHaveURL(/cart.html/);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, `UI-19: ${results.violations.length} accessibility violation(s) on cart page`).toEqual([]);
  });
});
