import PropTypes from 'prop-types';
import { removeSourceUrl, useSettings } from '@10up/headless-core';
import NextLink from 'next/link';

export const Link = ({ href, rel, children }) => {
	const settings = useSettings();
	const link = removeSourceUrl({ link: href, backendUrl: settings.url || '' });

	return (
		<NextLink href={link}>
			{/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
			<a rel={rel}>{children}</a>
		</NextLink>
	);
};

Link.propTypes = {
	href: PropTypes.string.isRequired,
	rel: PropTypes.string,
	children: PropTypes.node.isRequired,
};

Link.defaultProps = {
	rel: '',
};