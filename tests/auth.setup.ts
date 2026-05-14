import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill(process.env.UI_PASSWORD ?? 'secret_sauce');
  await page.getByTestId('login-button').click();
  
  await expect(page).toHaveURL(/inventory.html/);
  
  await page.context().storageState({ path: authFile });
});
