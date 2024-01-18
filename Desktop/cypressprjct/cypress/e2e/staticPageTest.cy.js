describe('Provera Statickih Stranica', () => {
    const staticPages = [
      { url: '/o-nama', title: 'O nama', contentString: 'O našoj kompaniji' },
      { url: '/uslovi-koriscenja', title: 'Uslovi korišćenja i prodaje', contentString: 'Opšti uslovi' }
      // Dodajte druge stranice prema potrebi
    ];
  
    beforeEach(() => {
      // Pretpostavljamo da ste navigirali do početne stranice ili je posetili
      cy.visit('https://www.games.rs'); // Zamijenite sa stvarnom URL adresom početne stranice
    });
  
    it('treba da ima tačne URL-ove, naslove i stringove na statičkim stranicama', () => {
      staticPages.forEach((page) => {
        cy.visit(page.url);
  
        // Provera tačnosti URL-a
        cy.url().should('include', page.url);
  
        // Provera prisutnosti naslova
        cy.get('h1').should('contain', page.title);
  
        // Provera prisutnosti određenog stringa na stranici
        cy.get('body').should('contain', page.contentString);
      });
    });
  });
  