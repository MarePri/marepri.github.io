/// <reference types="cypress"/>

describe('Provera Kontakt Informacija na Početnoj Stranici', () => {
    beforeEach(() => {
      // Pretpostavljamo da ste navigirali do početne stranice ili je posetili
      cy.visit('https://www.games.rs'); // Zamijenite sa stvarnom URL adresom početne stranice
    });
    
    it('treba da sadrži telefon i e-mail', () => {
      // Provera postojanja telefonskog broja
      cy.get('.item-telephone') // Zamijenite sa stvarnom klasom ili identifikatorom za telefon
        .should('exist');
      // Provera postojanja e-mail adrese
    })
        it('treba da sadrži linkove "Kontakt", "O nama" i "Pomoć" sa ispravnim URL-ovima', () => {
          // Provera postojanja linka "Kontakt" i ispravnosti URL-a
          cy.contains('a', 'KONTAKT')
            .should('have.attr', 'href')
            .and('include', '/kontakt'); // Zamijenite '/kontakt' sa stvarnim delom URL-a za stranicu "Kontakt"
      
          // Provera postojanja linka "O nama" i ispravnosti URL-a
          cy.contains('a', 'O NAMA')
            .should('have.attr', 'href')
            .and('include', '/o-nama'); // Zamijenite '/o-nama' sa stvarnim delom URL-a za stranicu "O nama"
      
          // Provera postojanja linka "Pomoć" i ispravnosti URL-a
          cy.contains('a', 'POMOĆ')
            .should('have.attr', 'href')
            .and('include', '/najcesca-pitanja'); // Zamijenite '/pomoc' sa stvarnim delom URL-a za stranicu "Pomoć"
        });
        
        it('Provera Vidljivosti Logoa i Slika', () => {
        
          it('treba da sadrži vidljiv logo', () => {
            // Provera vidljivosti logoa
            cy.get('.block logo') // Zamijenite sa stvarnom klasom ili identifikatorom logoa
              .should('be.visible');
          });
        });
        
      
    });
 
  