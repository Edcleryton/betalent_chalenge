import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CartPage } from './pages/CartPage';

const SLOW        = 15000;
const UI_URL                  = process.env.UI_URL as string;
const UI_PASSWORD             = process.env.UI_PASSWORD as string;
const PROBLEM_USER            = process.env.PROBLEM_USER as string;
const PERFORMANCE_GLITCH_USER = process.env.PERFORMANCE_GLITCH_USER as string;
const ERROR_USER              = process.env.ERROR_USER as string;
const VISUAL_USER             = process.env.VISUAL_USER as string;

test.describe('Sauce Demo - problem_user Authenticated Flow', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(PROBLEM_USER, UI_PASSWORD);
    await expect(page).toHaveURL(/inventory.html/);
  });

  test.afterEach(async ({ page }) => {
    await page.goto(`${UI_URL}/inventory.html`);
  });

  test('PU-01: product images are all identical (visual bug)', async ({ page }) => {
    const srcs = await page.locator('.inventory_item img')
      .evaluateAll((imgs: HTMLImageElement[]) => imgs.map(img => img.getAttribute('src')));
    const uniqueSrcs = new Set(srcs);
    expect(uniqueSrcs.size, `[BUG-PU-01] problem_user: ${srcs.length} products but only ${uniqueSrcs.size} unique image(s) — visual defect`).toBe(srcs.length);
  });

  test('PU-02: sorting does not reorder products (silent failure)', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const before = await page.locator('.inventory_item_name').allInnerTexts();
    await productsPage.sortProducts('za');
    const after = await page.locator('.inventory_item_name').allInnerTexts();
    expect(after, '[BUG-PU-02] problem_user: sort Z→A produced no change in product order').not.toEqual(before);
  });

  test('PU-03: add to cart fails for specific products (index 2)', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.addItemToCart(2);
    const badgeVisible = await productsPage.cartBadge.isVisible();
    expect(badgeVisible, '[BUG-PU-03] problem_user: cart badge did not appear after add to cart (index 2)').toBeTruthy();
  });

  test('PU-04: Last Name field in checkout step 1 is broken', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.addItemToCart(0);
    await productsPage.cartButton.click();
    await page.getByTestId('checkout').click();
    await page.getByTestId('firstName').fill('John');
    await page.getByTestId('lastName').fill('Smith');
    await page.getByTestId('postalCode').fill('12345');
    await page.getByTestId('continue').click();
    const stillOnStepOne = page.url().includes('checkout-step-one');
    expect(stillOnStepOne, '[BUG-PU-04] problem_user: cannot proceed past checkout step 1 — Last Name field broken').toBeFalsy();
  });

  test('PU-05: all four sort directions fail silently for problem_user', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    type SortOption = 'az' | 'za' | 'lohi' | 'hilo';
    const checks: Array<{ option: SortOption; verify: () => Promise<boolean> }> = [
      {
        option: 'az',
        verify: async () => {
          const names = await page.locator('.inventory_item_name').allInnerTexts();
          const sorted = [...names].sort((a, b) => a.localeCompare(b));
          return JSON.stringify(names) === JSON.stringify(sorted);
        }
      },
      {
        option: 'za',
        verify: async () => {
          const names = await page.locator('.inventory_item_name').allInnerTexts();
          const sorted = [...names].sort((a, b) => b.localeCompare(a));
          return JSON.stringify(names) === JSON.stringify(sorted);
        }
      },
      {
        option: 'lohi',
        verify: async () => {
          const prices = await page.locator('.inventory_item_price').allInnerTexts();
          const nums = prices.map(p => parseFloat(p.replace('$', '')));
          return JSON.stringify(nums) === JSON.stringify([...nums].sort((a, b) => a - b));
        }
      },
      {
        option: 'hilo',
        verify: async () => {
          const prices = await page.locator('.inventory_item_price').allInnerTexts();
          const nums = prices.map(p => parseFloat(p.replace('$', '')));
          return JSON.stringify(nums) === JSON.stringify([...nums].sort((a, b) => b - a));
        }
      }
    ];

    const failedSorts: string[] = [];
    for (const { option, verify } of checks) {
      await productsPage.sortProducts(option);
      const correct = await verify();
      if (!correct) failedSorts.push(option);
    }

    expect(failedSorts, `[BUG-PU-05] problem_user: sort options with wrong result order: ${failedSorts.join(', ')}`).toHaveLength(0);
  });

  test('PU-06: product detail page also shows wrong image (same broken src as inventory)', async ({ page }) => {
    const inventorySrc = await page.locator('.inventory_item img').first().getAttribute('src');
    await page.locator('.inventory_item_name').first().click();
    await expect(page).toHaveURL(/inventory-item.html/);
    const detailImg = page.locator('.inventory_details_img');
    await expect(detailImg).toBeVisible();
    const detailSrc = await detailImg.getAttribute('src');
    expect(detailSrc, '[BUG-PU-06] problem_user: product detail shows the same broken image as inventory listing').not.toBe(inventorySrc);
  });

  test('PU-07: identify all products that cannot be added to cart (indices 0-5)', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const failedIndices: number[] = [];
    let expectedCount = 0;

    for (let i = 0; i < 6; i++) {
      await productsPage.addItemToCart(i);
      const badgeVisible = await productsPage.cartBadge.isVisible();
      if (badgeVisible) {
        const actualCount = parseInt(await productsPage.cartBadge.innerText());
        expectedCount++;
        if (actualCount !== expectedCount) {
          failedIndices.push(i);
          expectedCount = actualCount;
        }
      } else {
        failedIndices.push(i);
      }
    }

    expect(failedIndices, `[BUG-PU-07] problem_user: add-to-cart failed for indices [${failedIndices.join(', ')}] — ${failedIndices.length}/6 items broken`).toHaveLength(0);
  });

  test('PU-08: console errors generated during problem_user interactions', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const productsPage = new ProductsPage(page);
    await productsPage.sortProducts('za');
    await productsPage.addItemToCart(2);
    await productsPage.cartButton.click();
    await page.getByTestId('checkout').click();
    await page.getByTestId('firstName').fill('John');
    await page.getByTestId('lastName').fill('Smith');
    await page.getByTestId('postalCode').fill('12345');
    await page.getByTestId('continue').click();

    expect(consoleErrors, `[BUG-PU-08] problem_user: ${consoleErrors.length} console error(s): ${consoleErrors.join(' | ')}`).toHaveLength(0);
  });
});

test.describe('Sauce Demo - performance_glitch_user Authenticated Flow', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(PERFORMANCE_GLITCH_USER, UI_PASSWORD);
    await expect(page).toHaveURL(/inventory.html/, { timeout: SLOW });
  });

  test.afterEach(async ({ page }) => {
    await page.goto(`${UI_URL}/inventory.html`);
  });

  test('PGU-01: should sort products despite slow performance', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.sortProducts('lohi');
    const prices = await page.locator('.inventory_item_price').allInnerTexts({ timeout: SLOW });
    const numeric = prices.map(p => parseFloat(p.replace('$', '')));
    expect(numeric).toEqual([...numeric].sort((a, b) => a - b));
  });

  test('PGU-02: should add item to cart despite slow performance', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.addItemToCart(0);
    await expect(productsPage.cartBadge).toHaveText('1', { timeout: SLOW });
  });

  test('PGU-03: should complete full checkout despite slow performance', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const checkoutPage = new CheckoutPage(page);
    await productsPage.addItemToCart(0);
    await expect(productsPage.cartBadge).toHaveText('1', { timeout: SLOW });
    await productsPage.cartButton.click();
    await expect(page).toHaveURL(/cart.html/, { timeout: SLOW });
    await checkoutPage.checkoutButton.click();
    await checkoutPage.fillInformation('John', 'Doe', '12345');
    await checkoutPage.finishButton.click();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!', { timeout: SLOW });
  });

  test('PGU-04: should logout successfully despite slow performance', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.logout();
    await expect(page).toHaveURL(`${UI_URL}/`, { timeout: SLOW });
  });

  test('PGU-05: product detail navigation works despite slow performance', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await page.locator('.inventory_item_name').first().click();
    await expect(page).toHaveURL(/inventory-item.html/, { timeout: SLOW });
    await page.getByTestId('back-to-products').click();
    await expect(page).toHaveURL(/inventory.html/, { timeout: SLOW });
    const itemCount = await productsPage.inventoryItems.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('PGU-06: multi-item cart and subtotal work despite slow performance', async ({ page }) => {
    test.setTimeout(SLOW * 5);
    const productsPage = new ProductsPage(page);
    const checkoutPage = new CheckoutPage(page);

    await productsPage.addItemToCart(0);
    await expect(productsPage.cartBadge).toHaveText('1', { timeout: SLOW });
    await productsPage.addItemToCart(1);
    await expect(productsPage.cartBadge).toHaveText('2', { timeout: SLOW });
    await productsPage.cartButton.click();
    await expect(page).toHaveURL(/cart.html/, { timeout: SLOW });

    await page.waitForSelector('.cart_item', { timeout: SLOW * 2 });
    const priceLocators = page.locator('.cart_item .inventory_item_price');
    const price0 = parseFloat((await priceLocators.nth(0).innerText({ timeout: SLOW })).replace('$', ''));
    const price1 = parseFloat((await priceLocators.nth(1).innerText({ timeout: SLOW })).replace('$', ''));

    await page.getByTestId('checkout').click();
    await checkoutPage.fillInformation('Test', 'User', '00000');
    await expect(page).toHaveURL(/checkout-step-two.html/, { timeout: SLOW });

    const subtotalText = await page.getByTestId('subtotal-label').innerText({ timeout: SLOW });
    const subtotal = parseFloat(subtotalText.match(/\$([0-9.]+)/)![1]);
    expect(subtotal).toBeCloseTo(price0 + price1, 2);
  });
});

test.describe('Sauce Demo - error_user Authenticated Flow', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(ERROR_USER, UI_PASSWORD);
    await expect(page).toHaveURL(/inventory.html/);
  });

  test.afterEach(async ({ page }) => {
    await page.goto(`${UI_URL}/inventory.html`);
  });

  test('EU-01: add to cart produces error or badge does not update', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.addItemToCart(0);
    const badgeVisible = await productsPage.cartBadge.isVisible();
    const errorVisible = await page.locator('[data-test="error"]').isVisible();
    expect(badgeVisible || errorVisible, '[BUG-EU-01] error_user: neither cart badge nor error message appeared after add to cart').toBeTruthy();
  });

  test('EU-02: checkout validates only one missing field at a time (broken multi-field)', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.addItemToCart(0);
    await productsPage.cartButton.click();
    await page.getByTestId('checkout').click();
    await page.getByTestId('firstName').fill('John');
    // Leave Last Name AND Postal Code empty intentionally
    await page.getByTestId('continue').click();
    const error = page.getByTestId('error');
    await expect(error).toBeVisible();
    const errorText = await error.innerText();
    expect(errorText, `[BUG-EU-02] error_user: checkout error shows "${errorText}" — expected "Last Name is required"`).toContain('Last Name is required');
  });

  test('EU-03: invalid postal code format produces silent failure (no error message)', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.addItemToCart(0);
    await productsPage.cartButton.click();
    await page.getByTestId('checkout').click();
    await page.getByTestId('firstName').fill('John');
    await page.getByTestId('lastName').fill('Doe');
    await page.getByTestId('postalCode').fill('ABCDE');
    await page.getByTestId('continue').click();
    const errorVisible = await page.getByTestId('error').isVisible();
    expect(errorVisible, '[BUG-EU-03] error_user: no error shown for non-numeric postal code — silent failure').toBeTruthy();
  });

  test('EU-04: error_user cannot complete checkout even with valid data', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const checkoutPage = new CheckoutPage(page);

    await productsPage.addItemToCart(0);
    const badgeVisible = await productsPage.cartBadge.isVisible();
    expect(badgeVisible, '[BUG-EU-04] error_user: add to cart failed — cannot reach checkout').toBeTruthy();

    await productsPage.cartButton.click();
    await expect(page).toHaveURL(/cart.html/);
    await checkoutPage.checkoutButton.click();
    await checkoutPage.fillInformation('John', 'Doe', '12345');

    const onStepTwo = page.url().includes('checkout-step-two');
    expect(onStepTwo, '[BUG-EU-04] error_user: blocked at checkout step 1 even with valid data').toBeTruthy();

    await checkoutPage.finishButton.click();
    const completed = await checkoutPage.completeHeader.isVisible();
    expect(completed, '[BUG-EU-04] error_user: checkout finish failed — order not completed').toBeTruthy();
  });

  test('EU-05: sort by price low-to-high works correctly for error_user', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.sortProducts('lohi');
    const prices = await page.locator('.inventory_item_price').allInnerTexts();
    const numeric = prices.map(p => parseFloat(p.replace('$', '')));
    const sorted = [...numeric].sort((a, b) => a - b);
    expect(numeric, '[BUG-EU-05] error_user: sort low→high failed to produce correct price order').toEqual(sorted);
  });

  test('EU-06: console errors triggered by error_user cart interactions', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const productsPage = new ProductsPage(page);
    for (let i = 0; i < 3; i++) {
      await productsPage.addItemToCart(i);
    }

    expect(consoleErrors, `[BUG-EU-06] error_user: ${consoleErrors.length} console error(s) during add-to-cart: ${consoleErrors.join(' | ')}`).toHaveLength(0);
  });
});

test.describe('Sauce Demo - visual_user Authenticated Flow', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(VISUAL_USER, UI_PASSWORD);
    await expect(page).toHaveURL(/inventory.html/);
  });

  test.afterEach(async ({ page }) => {
    await page.goto(`${UI_URL}/inventory.html`);
  });

  test('VU-01: product images are repeated across inventory (visual bug)', async ({ page }) => {
    const srcs = await page.locator('.inventory_item img')
      .evaluateAll((imgs: HTMLImageElement[]) => imgs.map(img => img.getAttribute('src')));
    const uniqueSrcs = new Set(srcs);
    expect(uniqueSrcs.size, `[BUG-VU-01] visual_user: ${srcs.length} products but only ${uniqueSrcs.size} unique image(s) — visual defect`).toBe(srcs.length);
  });

  test('VU-02: first product shows wrong image after sorting A→Z', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const imgBefore = await page.locator('.inventory_item img').first().getAttribute('src');
    await productsPage.sortProducts('az');
    const imgAfter = await page.locator('.inventory_item img').first().getAttribute('src');
    expect(imgBefore, '[BUG-VU-02] visual_user: first product image unchanged after A→Z sort — wrong image displayed').not.toBe(imgAfter);
  });

  test('VU-03: checkout button is visually misaligned (position logged for regression)', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.addItemToCart(0);
    await productsPage.cartButton.click();
    const checkoutBtn = page.getByTestId('checkout');
    await expect(checkoutBtn).toBeVisible();
    const box = await checkoutBtn.boundingBox();
    expect(box, '[BUG-VU-03] visual_user: checkout button bounding box is null').not.toBeNull();
    expect(box!.height, `[BUG-VU-03] visual_user: checkout button height is ${box?.height} — expected > 0`).toBeGreaterThan(0);
  });

  test('VU-04: product name text alignment is inconsistent across items', async ({ page }) => {
    const productNames = page.locator('.inventory_item_name');
    const count = await productNames.count();
    const alignments: string[] = [];
    for (let i = 0; i < count; i++) {
      const align = await productNames.nth(i).evaluate(
        (el: Element) => window.getComputedStyle(el).textAlign
      );
      alignments.push(align);
    }
    const uniqueAlignments = new Set(alignments);
    expect(uniqueAlignments.size, `[BUG-VU-04] visual_user: inconsistent text-align across products: ${[...uniqueAlignments].join(', ')}`).toBe(1);
  });

  test('VU-05: product detail page shows broken 404 image', async ({ page }) => {
    const inventorySrc = await page.locator('.inventory_item img').first().getAttribute('src');
    await page.locator('.inventory_item_name').first().click();
    await expect(page).toHaveURL(/inventory-item.html/);
    const detailImg = page.locator('.inventory_details_img');
    await expect(detailImg).toBeVisible();
    const detailSrc = await detailImg.getAttribute('src');
    const isBroken = detailSrc?.includes('sl-404') || detailSrc === inventorySrc;
    expect(isBroken, `[BUG-VU-05] visual_user: product detail page shows broken image: ${detailSrc}`).toBeFalsy();
  });

  test('VU-06: broken images persist across all four sort directions', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const SORTS = ['az', 'za', 'lohi', 'hilo'] as const;
    const sortsWithBrokenImages: string[] = [];

    for (const sort of SORTS) {
      await productsPage.sortProducts(sort);
      const srcs = await page.locator('.inventory_item img')
        .evaluateAll((imgs: HTMLImageElement[]) => imgs.map(img => img.getAttribute('src')));
      const hasBroken = srcs.some(src => src?.includes('sl-404'));
      if (hasBroken) sortsWithBrokenImages.push(sort);
    }

    expect(sortsWithBrokenImages, `[BUG-VU-06] visual_user: broken 404 images persist after sorts: ${sortsWithBrokenImages.join(', ')}`).toHaveLength(0);
  });

  test('VU-07: checkout button on cart page is positioned off-screen (x > 80% viewport)', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.addItemToCart(0);
    await productsPage.cartButton.click();
    await expect(page).toHaveURL(/cart.html/);

    const checkoutBtn = page.getByTestId('checkout');
    await expect(checkoutBtn).toBeVisible();
    const box = await checkoutBtn.boundingBox();
    const viewportWidth = page.viewportSize()?.width ?? 1280;
    const isOffscreen = (box?.x ?? 0) > viewportWidth * 0.8;

    expect(isOffscreen, `[BUG-VU-07] visual_user: cart checkout button is off-screen (x=${box?.x?.toFixed(0)}, viewport=${viewportWidth}px)`).toBeFalsy();
    expect(box?.y, `[BUG-VU-07] visual_user: cart checkout button y=${box?.y} — expected > 0`).toBeGreaterThan(0);
  });
});
