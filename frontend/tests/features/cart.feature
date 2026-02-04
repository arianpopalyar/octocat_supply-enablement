Feature: Shopping cart management
  As a supply chain planner
  I want to manage items in my shopping cart
  So that I can review and adjust my product selections before placing an order

  Background:
    Given I am authenticated
    And the product catalog has available items

  Scenario: View empty cart
    Given I have no items in my cart
    When I navigate to the cart page
    Then I see the empty cart message "Your cart is empty"
    And I see a "Browse Products" link to the product catalog

  Scenario: Add a product to the cart from the product catalog
    Given I am viewing the product catalog
    And I see a product "SmartFeeder One" with price "$249.99"
    When I add the product to my cart with quantity "2"
    Then the cart icon shows "2" items
    When I navigate to the cart page
    Then I see "SmartFeeder One" in my cart
    And the quantity for "SmartFeeder One" is "2"
    And the line total for "SmartFeeder One" is "$499.98"

  Scenario: Update product quantity in cart
    Given I have "SmartFeeder One" in my cart with quantity "2"
    When I navigate to the cart page
    And I increase the quantity of "SmartFeeder One" by clicking the plus button
    Then the quantity for "SmartFeeder One" is "3"
    And the line total for "SmartFeeder One" is "$749.97"
    And the cart total is "$749.97"

  Scenario: Decrease product quantity in cart
    Given I have "SmartFeeder One" in my cart with quantity "3"
    When I navigate to the cart page
    And I decrease the quantity of "SmartFeeder One" by clicking the minus button
    Then the quantity for "SmartFeeder One" is "2"
    And the line total for "SmartFeeder One" is "$499.98"
    And the cart total is "$499.98"

  Scenario: Remove product from cart by decreasing quantity to zero
    Given I have "SmartFeeder One" in my cart with quantity "1"
    When I navigate to the cart page
    And I decrease the quantity of "SmartFeeder One" by clicking the minus button
    Then I see the empty cart message "Your cart is empty"
    And the cart icon shows "0" items

  Scenario: Remove product from cart using remove button
    Given I have "SmartFeeder One" in my cart with quantity "2"
    When I navigate to the cart page
    And I click the remove button for "SmartFeeder One"
    Then I see the empty cart message "Your cart is empty"
    And the cart icon shows "0" items

  Scenario: Clear entire cart with multiple items
    Given I have the following items in my cart:
      | product              | quantity | price   |
      | SmartFeeder One      | 2        | $249.99 |
      | CatPurrCollar        | 1        | $129.99 |
    When I navigate to the cart page
    Then the cart total is "$629.97"
    When I click the "Clear Cart" button
    Then I see the empty cart message "Your cart is empty"
    And the cart icon shows "0" items

  Scenario: Calculate correct cart total with multiple items
    Given I have the following items in my cart:
      | product              | quantity | price   |
      | SmartFeeder One      | 2        | $249.99 |
      | CatPurrCollar        | 3        | $129.99 |
      | SmartLitterBox       | 1        | $299.99 |
    When I navigate to the cart page
    Then I see "SmartFeeder One" with quantity "2" and line total "$499.98"
    And I see "CatPurrCollar" with quantity "3" and line total "$389.97"
    And I see "SmartLitterBox" with quantity "1" and line total "$299.99"
    And the cart total is "$1,189.94"

  Scenario: Continue shopping from empty cart
    Given I have no items in my cart
    When I navigate to the cart page
    And I click the "Browse Products" link
    Then I am redirected to the product catalog page
    And I see the catalog header "Products"

  Scenario: Continue shopping from cart with items
    Given I have "SmartFeeder One" in my cart with quantity "1"
    When I navigate to the cart page
    And I click the "Continue Shopping" link
    Then I am redirected to the product catalog page
    And I see the catalog header "Products"

  Scenario: View cart persists across page navigation
    Given I have "SmartFeeder One" in my cart with quantity "2"
    When I navigate to the cart page
    Then the quantity for "SmartFeeder One" is "2"
    When I navigate to the home page
    And I navigate back to the cart page
    Then the quantity for "SmartFeeder One" is "2"
    And the cart total is "$499.98"

  Scenario: Product SKU is displayed in cart
    Given I have "SmartFeeder One" in my cart with quantity "1"
    When I navigate to the cart page
    Then I see the SKU information for "SmartFeeder One"

  Scenario: Product image is displayed in cart
    Given I have "SmartFeeder One" in my cart with quantity "1"
    When I navigate to the cart page
    Then I see the product image for "SmartFeeder One"

  Scenario: Proceed to checkout button is visible
    Given I have "SmartFeeder One" in my cart with quantity "1"
    When I navigate to the cart page
    Then I see the "Proceed to Checkout" button
