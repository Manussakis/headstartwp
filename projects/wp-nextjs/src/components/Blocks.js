import { BlocksRenderer } from '@10up/headless-core';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { isAnchorTag, isImageTag } from '@10up/headless-core/dom';
import { ImageBlock, LinkBlock } from '@10up/headless-next/blocks';

/**
 * This is an exmaple of a test function. This one checks if the node is a blockquote
 *
 * @param {import('html-react-parser').DOMNode} node The node object
 *
 * @returns true if the node is a blockquote
 */
function isBlockQuote(node) {
	return node.type === 'tag' && node.name === 'blockquote';
}

/**
 * An Example of custom Block component. This will replace every blockquote elements with this component
 *
 * @param {import('@10up/headless-core').BlockDef} props The Block props
 *
 * @returns BlockQuote component
 */
const ExampleBlockQuote = ({ domNode, children }) => {
	// get the gb custom class
	const className = domNode.attribs.class;
	// gets the anchor
	const { id } = domNode.attribs;

	/**
	 * if the block is complex you probably want to split the Block component with the actual React component
	 * return <MyBlokquote>{children}</MyBlockquote>
	 */
	return (
		<blockquote id={id} className={clsx(className, 'my-custom-class-component')}>
			{children} <strong>- By 10up Next.js framework</strong>
		</blockquote>
	);
};

ExampleBlockQuote.propTypes = {
	domNode: PropTypes.shape({
		attribs: {
			className: PropTypes.string,
		},
	}).isRequired,
	children: PropTypes.node.isRequired,
};

export const Blocks = ({ html }) => {
	return (
		<div style={{ position: 'relative' }}>
			<BlocksRenderer html={html}>
				<LinkBlock test={(node) => isAnchorTag(node, { isInternalLink: true })} />
				<ImageBlock test={(node) => isImageTag(node, { hasDimensions: true })} />
				<ExampleBlockQuote test={isBlockQuote} />
			</BlocksRenderer>
		</div>
	);
};

Blocks.propTypes = {
	html: PropTypes.string.isRequired,
};