/// <reference types="cypress" />

describe('Test User Login', () => {
  it('Connects with Metamask', () => {
    cy.visit('/');
    // find "Connect Wallet" button and click it
    cy.get('nav').within(() => {
      cy.findByRole('button', { name: /connect wallet/i }).click();
    });
    // assuming there is only metamask popping up
    // always important to switch between metamask and cypress window
    cy.switchToMetamaskWindow();
    // connect to dapp
    cy.acceptMetamaskAccess(undefined).should('be.true');

    // Confirming not needed?
    // cy.confirmMetamaskSignatureRequest();

    // switch back to cypress window (your dApp)
    cy.switchToCypressWindow();
    // check UI change
    cy.findByRole('button', { name: /0xf39F\.\.\.2266/i }).should('be.visible');
  });
});
