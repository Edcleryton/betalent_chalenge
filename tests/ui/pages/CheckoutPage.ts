import { Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  readonly checkoutButton = this.page.getByTestId('checkout');
  readonly firstNameInput = this.page.getByTestId('firstName');
  readonly lastNameInput = this.page.getByTestId('lastName');
  readonly zipCodeInput = this.page.getByTestId('postalCode');
  readonly continueButton = this.page.getByTestId('continue');
  readonly finishButton = this.page.getByTestId('finish');
  readonly completeHeader = this.page.getByTestId('complete-header');

  async fillInformation(first: string, last: string, zip: string) {
    await this.firstNameInput.fill(first);
    await this.lastNameInput.fill(last);
    await this.zipCodeInput.fill(zip);
    await this.continueButton.click();
  }
}
