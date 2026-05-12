import { Page } from '@playwright/test';

export class ProductsPage {
  constructor(public readonly page: Page) {}

  readonly title = this.page.getByTestId('title');
  readonly inventoryItems = this.page.getByTestId('inventory-item');
  readonly sortSelect = this.page.getByTestId('product-sort-container');
  readonly cartBadge = this.page.getByTestId('shopping-cart-badge');
  readonly cartButton = this.page.getByTestId('shopping-cart-link');
  readonly menuButton = this.page.getByRole('button', { name: 'Open Menu' });
  readonly logoutLink = this.page.getByTestId('logout-sidebar-link');

  async addItemToCart(index: number = 0) {
    await this.inventoryItems.nth(index).getByRole('button').click();
  }

  async removeItemFromCart(index: number = 0) {
    await this.inventoryItems.nth(index).getByRole('button').click();
  }

  async sortProducts(option: string) {
    await this.sortSelect.selectOption(option);
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
