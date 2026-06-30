describe("Login/Logout Test", () => {
  beforeEach(() => {
    cy.visit("https://www.games.com");

    cy.contains("a", "Log In").click();
  });

  it("Prijavljivanje ", () => {
    cy.get("#email-input").type(Cypress.config("user").email);
    cy.get("#password-input").type(Cypress.config("user").password);
    cy.get("#submit-button").click();

    cy.url().should("include", "/dashboard");
  });

  it("Odjavljivanje", () => {
    cy.get("#logout-button").click();

    cy.url().should("include", "/");
  });
});
