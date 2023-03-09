import { fetchRedirect } from '../fetchRedirect';

/**
 * Redirects are mocked in msw
 *
 * see test/server-handlers.ts
 */
describe('fetchRedirect', () => {
	it('catches redirect', async () => {
		const result = await fetchRedirect('/redirect-test', 'http://example.com/');

		expect(result.location).toBe('/redirected-page');
		expect(result.status).toBe(301);
	});

	it('does not cause infinite loops', async () => {
		const result = await fetchRedirect('/infinite-loop', 'http://example.com/');

		expect(result.location).toBeNull();
	});

	it('ignore wp-login.php', async () => {
		const result = await fetchRedirect('/rsa-blocked-page', 'http://example.com/');

		expect(result.location).toBeNull();
	});

	it('ignores missing slash', async () => {
		const result = await fetchRedirect('/redirect-test-missing-slash', 'http://example.com/');

		expect(result.location).toBeNull();
	});

	it('ignores added slash', async () => {
		const result = await fetchRedirect('/redirect-test-missing-slash/', 'http://example.com/');

		expect(result.location).toBeNull();
	});
});
