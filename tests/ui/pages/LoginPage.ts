import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  readonly usernameInput = this.page.getByTestId('username');
  readonly passwordInput = this.page.getByTestId('password');
  readonly loginButton = this.page.getByTestId('login-button');
  readonly errorMessage = this.page.getByTestId('error');

  async navigate() {
    await this.page.goto(process.env.UI_URL ?? 'https://www.saucedemo.com');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
