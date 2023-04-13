import { isTwitterEmbed } from '@10up/headless-core';
import { IBlock, IBlockAttributes } from '@10up/headless-core/react';
import Script from 'next/script';

/**
 * Renders a twitter embed
 *
 * ## Usage
 *
 * ```tsx
 * import { BlocksRenderer } from "@10up/headless-core/react";
 * import { TwitterBlock } from "@10up/headless-next";
 *
 * <BlocksRenderer html={html}>
 * 	<TwitterBlock />
 * </BlocksRenderer>
 * ```
 *
 * @param props Link Block Props
 * @param props.domNode The domNode element
 * @param props.children Children prop
 *
 * @category React Components
 */
export function TwitterBlock({ children }: Omit<IBlock<IBlockAttributes>, 'component'>) {
	return (
		<>
			<Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />

			{children}
		</>
	);
}

/**
 * @internal
 */
// eslint-disable-next-line no-redeclare
export namespace TwitterBlock {
	export const defaultProps = {
		test: (node) => isTwitterEmbed(node),
	};
}
