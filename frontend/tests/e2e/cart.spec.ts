import { test, expect } from "@playwright/test";

/**
 * Shopping cart management E2E tests
 * Implements: frontend/tests/features/cart.feature
 *
 * Covers:
 * - Empty cart state and navigation
 * - Adding products to cart from catalog
 * - Updating item quantities (increase/decrease)
 * - Removing items from cart
 * - Clearing entire cart
 * - Cart total calculations
 * - Product information display (SKU, image, price)
 * - Cart persistence across navigation
 * - Continue shopping and checkout flows
 */

test.describe("Shopping cart management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app to initialize context
    await page.goto("/");
    // Clear any existing cart data from localStorage
    await page.evaluate(() => localStorage.clear());
  });

  test("View empty cart", async ({ page }) => {
    // Given I have no items in my cart
    // (cleared in beforeEach)

    // When I navigate to the cart page
    await page.goto("/cart");

    // Then I see the empty cart message "Your cart is empty"
    await expect(
      page.locator('h2:has-text("Your cart is empty")'),
    ).toBeVisible();

    // And I see a "Browse Products" link to the product catalog
    const browseLink = page.locator('a:has-text("Browse Products")');
    await expect(browseLink).toBeVisible();
    await expect(browseLink).toHaveAttribute("href", "/products");
  });

  test("Add a product to the cart from the product catalog", async ({
    page,
  }) => {
    // Given I am viewing the product catalog
    await page.goto("/products");
    await expect(page.locator('h1:has-text("Products")')).toBeVisible();

    // And I see a product "SmartFeeder One" with price "$249.99"
    const productCard = page
      .locator("div")
      .filter({ hasText: /SmartFeeder One/i })
      .first();
    await expect(productCard).toBeVisible();
    await expect(productCard.locator("text=/\\$249\\.99/")).toBeVisible();

    // When I add the product to my cart with quantity "2"
    const quantityInput = productCard.locator('input[type="number"]');
    await quantityInput.fill("2");

    const addToCartButton = productCard.locator(
      'button:has-text("Add to Cart")',
    );
    await addToCartButton.click();

    // Then the cart icon shows "2" items
    const cartBadge = page
      .locator("nav")
      .locator("span")
      .filter({ hasText: "2" });
    await expect(cartBadge).toBeVisible();

    // When I navigate to the cart page
    await page.click('nav a[href="/cart"]');
    await expect(page).toHaveURL(/\/cart/);

    // Then I see "SmartFeeder One" in my cart
    const cartItem = page.locator('h3:has-text("SmartFeeder One")');
    await expect(cartItem).toBeVisible();

    // And the quantity for "SmartFeeder One" is "2"
    const cartItemContainer = page
      .locator("div")
      .filter({ hasText: /SmartFeeder One/ })
      .first();
    const quantity = cartItemContainer
      .locator("span")
      .filter({ hasText: /^2$/ });
    await expect(quantity).toBeVisible();

    // And the line total for "SmartFeeder One" is "$499.98"
    await expect(cartItemContainer.locator("text=/\\$499\\.98/")).toBeVisible();
  });

  test("Update product quantity in cart", async ({ page }) => {
    // Given I have "SmartFeeder One" in my cart with quantity "2"
    await addProductToCart(page, "SmartFeeder One", 2);

    // When I navigate to the cart page
    await page.goto("/cart");

    // And I increase the quantity of "SmartFeeder One" by clicking the plus button
    const cartItemContainer = page
      .locator("div")
      .filter({ hasText: /SmartFeeder One/ })
      .first();
    const increaseButton = cartItemContainer.locator(
      'button[aria-label="Increase quantity"]',
    );
    await increaseButton.click();

    // Then the quantity for "SmartFeeder One" is "3"
    const quantity = cartItemContainer
      .locator("span")
      .filter({ hasText: /^3$/ });
    await expect(quantity).toBeVisible();

    // And the line total for "SmartFeeder One" is "$749.97"
    await expect(cartItemContainer.locator("text=/\\$749\\.97/")).toBeVisible();

    // And the cart total is "$749.97"
    await expect(
      page.locator("text=/Total:/").locator("..").locator("text=/\\$749\\.97/"),
    ).toBeVisible();
  });

  test("Decrease product quantity in cart", async ({ page }) => {
    // Given I have "SmartFeeder One" in my cart with quantity "3"
    await addProductToCart(page, "SmartFeeder One", 3);

    // When I navigate to the cart page
    await page.goto("/cart");

    // And I decrease the quantity of "SmartFeeder One" by clicking the minus button
    const cartItemContainer = page
      .locator("div")
      .filter({ hasText: /SmartFeeder One/ })
      .first();
    const decreaseButton = cartItemContainer.locator(
      'button[aria-label="Decrease quantity"]',
    );
    await decreaseButton.click();

    // Then the quantity for "SmartFeeder One" is "2"
    const quantity = cartItemContainer
      .locator("span")
      .filter({ hasText: /^2$/ });
    await expect(quantity).toBeVisible();

    // And the line total for "SmartFeeder One" is "$499.98"
    await expect(cartItemContainer.locator("text=/\\$499\\.98/")).toBeVisible();

    // And the cart total is "$499.98"
    await expect(
      page.locator("text=/Total:/").locator("..").locator("text=/\\$499\\.98/"),
    ).toBeVisible();
  });

  test("Remove product from cart by decreasing quantity to zero", async ({
    page,
  }) => {
    // Given I have "SmartFeeder One" in my cart with quantity "1"
    await addProductToCart(page, "SmartFeeder One", 1);

    // When I navigate to the cart page
    await page.goto("/cart");

    // And I decrease the quantity of "SmartFeeder One" by clicking the minus button
    const decreaseButton = page.locator(
      'button[aria-label="Decrease quantity"]',
    );
    await decreaseButton.click();

    // Then I see the empty cart message "Your cart is empty"
    await expect(
      page.locator('h2:has-text("Your cart is empty")'),
    ).toBeVisible();

    // And the cart icon shows "0" items (or is hidden)
    const cartBadge = page
      .locator("nav")
      .locator("span")
      .filter({ hasText: /^\d+$/ });
    await expect(cartBadge).not.toBeVisible();
  });

  test("Remove product from cart using remove button", async ({ page }) => {
    // Given I have "SmartFeeder One" in my cart with quantity "2"
    await addProductToCart(page, "SmartFeeder One", 2);

    // When I navigate to the cart page
    await page.goto("/cart");

    // And I click the remove button for "SmartFeeder One"
    const removeButton = page.locator('button[aria-label="Remove item"]');
    await removeButton.click();

    // Then I see the empty cart message "Your cart is empty"
    await expect(
      page.locator('h2:has-text("Your cart is empty")'),
    ).toBeVisible();

    // And the cart icon shows "0" items (or is hidden)
    const cartBadge = page
      .locator("nav")
      .locator("span")
      .filter({ hasText: /^\d+$/ });
    await expect(cartBadge).not.toBeVisible();
  });

  test("Clear entire cart with multiple items", async ({ page }) => {
    // Given I have the following items in my cart:
    await addProductToCart(page, "SmartFeeder One", 2);
    await addProductToCart(page, "CatPurrCollar", 1);

    // When I navigate to the cart page
    await page.goto("/cart");

    // Then the cart total is "$629.97"
    await expect(
      page.locator("text=/Total:/").locator("..").locator("text=/\\$629\\.97/"),
    ).toBeVisible();

    // When I click the "Clear Cart" button
    const clearButton = page.locator('button:has-text("Clear Cart")');
    await clearButton.click();

    // Then I see the empty cart message "Your cart is empty"
    await expect(
      page.locator('h2:has-text("Your cart is empty")'),
    ).toBeVisible();

    // And the cart icon shows "0" items (or is hidden)
    const cartBadge = page
      .locator("nav")
      .locator("span")
      .filter({ hasText: /^\d+$/ });
    await expect(cartBadge).not.toBeVisible();
  });

  test("Calculate correct cart total with multiple items", async ({ page }) => {
    // Given I have the following items in my cart:
    await addProductToCart(page, "SmartFeeder One", 2);
    await addProductToCart(page, "CatPurrCollar", 3);
    await addProductToCart(page, "SmartLitterBox", 1);

    // When I navigate to the cart page
    await page.goto("/cart");

    // Then I see "SmartFeeder One" with quantity "2" and line total "$499.98"
    const smartFeederItem = page
      .locator("div")
      .filter({ hasText: /SmartFeeder One/ })
      .first();
    await expect(
      smartFeederItem.locator("span").filter({ hasText: /^2$/ }),
    ).toBeVisible();
    await expect(smartFeederItem.locator("text=/\\$499\\.98/")).toBeVisible();

    // And I see "CatPurrCollar" with quantity "3" and line total "$389.97"
    const catPurrItem = page
      .locator("div")
      .filter({ hasText: /CatPurrCollar/ })
      .first();
    await expect(
      catPurrItem.locator("span").filter({ hasText: /^3$/ }),
    ).toBeVisible();
    await expect(catPurrItem.locator("text=/\\$389\\.97/")).toBeVisible();

    // And I see "SmartLitterBox" with quantity "1" and line total "$299.99"
    const litterBoxItem = page
      .locator("div")
      .filter({ hasText: /SmartLitterBox/ })
      .first();
    await expect(
      litterBoxItem.locator("span").filter({ hasText: /^1$/ }),
    ).toBeVisible();
    await expect(litterBoxItem.locator("text=/\\$299\\.99/")).toBeVisible();

    // And the cart total is "$1,189.94"
    await expect(
      page
        .locator("text=/Total:/")
        .locator("..")
        .locator("text=/\\$1,189\\.94/"),
    ).toBeVisible();
  });

  test("Continue shopping from empty cart", async ({ page }) => {
    // Given I have no items in my cart
    // (cleared in beforeEach)

    // When I navigate to the cart page
    await page.goto("/cart");

    // And I click the "Browse Products" link
    await page.click('a:has-text("Browse Products")');

    // Then I am redirected to the product catalog page
    await expect(page).toHaveURL(/\/products/);

    // And I see the catalog header "Products"
    await expect(page.locator('h1:has-text("Products")')).toBeVisible();
  });

  test("Continue shopping from cart with items", async ({ page }) => {
    // Given I have "SmartFeeder One" in my cart with quantity "1"
    await addProductToCart(page, "SmartFeeder One", 1);

    // When I navigate to the cart page
    await page.goto("/cart");

    // And I click the "Continue Shopping" link
    await page.click('a:has-text("Continue Shopping")');

    // Then I am redirected to the product catalog page
    await expect(page).toHaveURL(/\/products/);

    // And I see the catalog header "Products"
    await expect(page.locator('h1:has-text("Products")')).toBeVisible();
  });

  test("View cart persists across page navigation", async ({ page }) => {
    // Given I have "SmartFeeder One" in my cart with quantity "2"
    await addProductToCart(page, "SmartFeeder One", 2);

    // When I navigate to the cart page
    await page.goto("/cart");

    // Then the quantity for "SmartFeeder One" is "2"
    const cartItemContainer = page
      .locator("div")
      .filter({ hasText: /SmartFeeder One/ })
      .first();
    await expect(
      cartItemContainer.locator("span").filter({ hasText: /^2$/ }),
    ).toBeVisible();

    // When I navigate to the home page
    await page.goto("/");

    // And I navigate back to the cart page
    await page.goto("/cart");

    // Then the quantity for "SmartFeeder One" is "2"
    const cartItemAfterNav = page
      .locator("div")
      .filter({ hasText: /SmartFeeder One/ })
      .first();
    await expect(
      cartItemAfterNav.locator("span").filter({ hasText: /^2$/ }),
    ).toBeVisible();

    // And the cart total is "$499.98"
    await expect(
      page.locator("text=/Total:/").locator("..").locator("text=/\\$499\\.98/"),
    ).toBeVisible();
  });

  test("Product SKU is displayed in cart", async ({ page }) => {
    // Given I have "SmartFeeder One" in my cart with quantity "1"
    await addProductToCart(page, "SmartFeeder One", 1);

    // When I navigate to the cart page
    await page.goto("/cart");

    // Then I see the SKU information for "SmartFeeder One"
    const skuText = page.locator("text=/SKU:/");
    await expect(skuText).toBeVisible();
  });

  test("Product image is displayed in cart", async ({ page }) => {
    // Given I have "SmartFeeder One" in my cart with quantity "1"
    await addProductToCart(page, "SmartFeeder One", 1);

    // When I navigate to the cart page
    await page.goto("/cart");

    // Then I see the product image for "SmartFeeder One"
    const productImage = page.locator('img[alt*="SmartFeeder"]');
    await expect(productImage).toBeVisible();
  });

  test("Proceed to checkout button is visible", async ({ page }) => {
    // Given I have "SmartFeeder One" in my cart with quantity "1"
    await addProductToCart(page, "SmartFeeder One", 1);

    // When I navigate to the cart page
    await page.goto("/cart");

    // Then I see the "Proceed to Checkout" button
    const checkoutButton = page.locator(
      'button:has-text("Proceed to Checkout")',
    );
    await expect(checkoutButton).toBeVisible();
  });
});

/**
 * Helper function to add a product to the cart
 * Navigates to products page, finds the product, and adds it with specified quantity
 */
async function addProductToCart(
  page: any,
  productName: string,
  quantity: number,
) {
  await page.goto("/products");
  await expect(page.locator('h1:has-text("Products")')).toBeVisible();

  // Find the product card
  const productCard = page
    .locator("div")
    .filter({ hasText: new RegExp(productName, "i") })
    .first();
  await expect(productCard).toBeVisible();

  // Set quantity
  const quantityInput = productCard.locator('input[type="number"]');
  await quantityInput.fill(quantity.toString());

  // Click add to cart
  const addToCartButton = productCard.locator('button:has-text("Add to Cart")');
  await addToCartButton.click();

  // Wait for the cart to update (badge should appear)
  await page.waitForTimeout(500);
}
