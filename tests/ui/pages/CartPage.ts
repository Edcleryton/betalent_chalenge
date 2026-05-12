import { Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  readonly cartList               = this.page.getByTestId('cart-list');
  readonly cartItems              = this.page.getByTestId('cart-item');
  readonly continueShoppingButton = this.page.getByTestId('continue-shopping');
  readonly checkoutButton         = this.page.getByTestId('checkout');

  itemName(index: number)     { return this.cartItems.nth(index).getByTestId('inventory-item-name'); }
  itemPrice(index: number)    { return this.cartItems.nth(index).getByTestId('inventory-item-price'); }
  itemQuantity(index: number) { return this.cartItems.nth(index).getByTestId('item-quantity'); }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }
}
