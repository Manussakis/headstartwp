import { HeadlessApp } from '@10up/headless-next';

// css
import '../styles.css';

// eslint-disable-next-line react/prop-types
const MyApp = ({ Component, pageProps }) => {
	// eslint-disable-next-line
	const { fallback = {}, ...props } = pageProps;

	return (
		<HeadlessApp
			pageProps={pageProps}
			swrConfig={{
				revalidateOnFocus: true,
				revalidateOnReconnect: true,
				revalidateOnMount: true,
			}}
		>
			<Component {...props} />
		</HeadlessApp>
	);
};

export default MyApp;
