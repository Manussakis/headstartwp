describe('HeadstartWP', () => {
	it('opens the headless frontend URL', () => {
		cy.visit('/');
		cy.url().should('eq', Cypress.config('baseUrl'));
	});

	it('opens uncategorized category archive', () => {
		cy.visit('/');
		cy.findByRole('link', {name: /uncategorized/i }).click();
		cy.url().should('include', '/category/uncategorized');
	});

	it('opens Hello World post', () => {
		cy.visit('/');
		cy.findByRole('link', {name: /uncategorized/i }).click();
		cy.url().should('include', '/category/uncategorized');
		cy.findByRole('link', {name: /hello world/i }).click();
		cy.url().should('include', '/hello-world');
	});
});
