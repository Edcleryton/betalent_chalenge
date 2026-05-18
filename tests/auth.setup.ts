import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto(process.env.UI_URL as string);
  await page.getByTestId('username').fill(process.env.STANDARD_USER as string);
  await page.getByTestId('password').fill(process.env.UI_PASSWORD as string);
  await page.getByTestId('login-button').click();
  
  await expect(page).toHaveURL(/inventory.html/);
  
  await page.context().storageState({ path: authFile });
});
