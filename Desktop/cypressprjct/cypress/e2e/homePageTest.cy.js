/// <reference types="cypress"/>

describe("Provera HP", () => {
  beforeEach(() => {
    cy.intercept({ resourceType: /xhr|fetch/ }, { log: false });
    cy.visit("https://www.games.rs");
  });

  it("treba da sadrži telefon i e-mail", () => {
    cy.get(".item-telephone").should("exist");
  });
  it("treba da sadrži linkove", () => {
    cy.contains("a", "KONTAKT")
      .should("have.attr", "href")
      .and("include", "/kontakt");

    cy.contains("a", "O NAMA")
      .should("have.attr", "href")
      .and("include", "/o-nama");

    cy.contains("a", "POMOĆ")
      .should("have.attr", "href")
      .and("include", "/najcesca-pitanja");
  });

  it("provera logo", () => {
    it("treba da se vidi logo", () => {
      cy.get(".block logo").should("be.visible");
    });
  });
});
