import { wpKsesPost } from '../wpKsesPost';

describe('wp_kses_post', () => {
	it('properly sanitizes html', () => {
		expect(
			wpKsesPost(
				'<div class="class-name">This Will Become a p tag</div><div>This Will Become a p tag</div>',
			),
		).toBe(
			'<div class="class-name">This Will Become a p tag</div><div>This Will Become a p tag</div>',
		);
		expect(wpKsesPost('<p>Hello World</p>')).toEqual('<p>Hello World</p>');
		expect(wpKsesPost('<p class="test">Hello World</p>')).toEqual(
			'<p class="test">Hello World</p>',
		);
		expect(wpKsesPost('<p><script>alert("danger");</script>Hello World</p>')).toEqual(
			'<p>Hello World</p>',
		);
		expect(wpKsesPost('<p><script>alert("</script>Hello World</p>')).toEqual(
			'<p>Hello World</p>',
		);
	});

	it('respects the allowhtml tags', () => {
		expect(wpKsesPost('<p>Hello World</p>', ['p'])).toEqual('<p>Hello World</p>');
		expect(wpKsesPost('<div><div class="test"</div><p>Hello World</p></div>', ['p'])).toEqual(
			'<p>Hello World</p>',
		);
		expect(wpKsesPost('<p><iframe></iframe>Hello World</p>', ['p'])).toEqual(
			'<p>Hello World</p>',
		);
		expect(
			wpKsesPost('<p><iframe src="asd"></iframe>Hello World</p>', ['p', 'iframe']),
		).toEqual('<p><iframe src="asd"></iframe>Hello World</p>');
	});
});
