import { isBlock } from '../../dom';
import { IBlock } from '../components';
import { useBlock } from './hooks';
import { IBlockAttributes } from './types';
import { getInlineStyles } from './utils';

export interface SpacerBlockProps extends IBlockAttributes {
	height?: string;
}

export interface ISpacerBlock extends IBlock<SpacerBlockProps> {}

export const SpacerBlock = ({ domNode: node, children, component: Component }: ISpacerBlock) => {
	const { name, className } = useBlock<SpacerBlockProps>(node);
	const style = getInlineStyles(node);
	const height = style ? style.height : '';
	return (
		<Component
			name={name}
			domNode={node}
			className={className}
			htmlAnchor={node.attribs.id || ''}
			height={height}
		>
			{children}
		</Component>
	);
};

SpacerBlock.defaultProps = {
	test: (node) => {
		return isBlock(node, { tagName: 'div', className: 'wp-block-spacer' });
	},
};