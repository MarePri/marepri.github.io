describe("Provera Static page", () => {
  const staticPages = [
    {
      url: "/o-nama",
      title: "O nama",
      contentString:
        "GameS je lanac prodavnica specijalizovan za prodaju konzola",
    },
  ];

  beforeEach(() => {
    cy.visit("https://www.games.rs");
  });

  it("Static page", () => {
    staticPages.forEach((page) => {
      cy.visit("https://www.games.rs/o-nama");

      cy.url().should("include", page.url);

      cy.get("h1").should("contain", page.title);

      cy.get("body").should("contain", page.contentString);

      it("tacan url i h1", () => {
        cy.contains("a", "Uslovi korišćenja i prodaje").click();

        cy.url().should("include", "/uslovi-koriscenja");

        cy.get("h1").should("contain", "Uslovi korišćenja i prodaje");

        cy.get("body").should("contain", "Opšti uslovi");
        cy.get("body").should("contain", "Prodaja i isporuka");
      });
    });
  });
});
