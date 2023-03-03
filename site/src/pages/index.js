/* eslint-disable import/no-unresolved */
import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import SearchBar from '@theme/SearchBar';

import guideSketch from '@site/static/img/guides-sketch.png';
import referenceSketch from '@site/static/img/reference-sketch.png';
import principlesSketch from '@site/static/img/priciples-sketch.png';

import styles from './index.module.css';

export default function Home() {
	const { siteConfig } = useDocusaurusContext();
	return (
		<Layout title={`${siteConfig.title}`}>
			<main>
				<header className={`${styles.heroBanner} home__heroBanner`}>
					<h1>
						10up Headless Framework <span className={`${styles.beta}`}>Beta</span>
					</h1>
					<p>A framework for building headless WordPress sites.</p>
					<SearchBar className={styles.searchBar} />
				</header>
				<section className={`${styles.grid} content-wrapper`}>
					<article className={`${styles.gridItem} homeGrid__item`}>
						<Link to="/docs">
							<img
								src={guideSketch}
								alt="Two hand drawn books with light bulb over them"
								width={176}
								height={237}
							/>
						</Link>
						<h2>Documentation</h2>
						<p>
							If you are unsure how to do something with the framework, this is where
							you should start.
						</p>
						<Link className={styles.gridLink} to="/docs/">
							Give me the details
						</Link>
					</article>

					<article className={`${styles.gridItem} homeGrid__item`}>
						<Link to="/api">
							<img
								src={referenceSketch}
								alt="Hand drawn papers"
								width={279}
								height={344}
							/>
						</Link>
						<h2>API Reference</h2>
						<p>
							Browse through the autogenerated TypeScript docs. Find detailed
							information about every function, class and React components in the
							framework.
						</p>
						<Link className={styles.gridLink} to="/api/">
							Quick access
						</Link>
					</article>

					<article className={`${styles.gridItem} homeGrid__item`}>
						<Link to="/philosophy">
							<img
								src={principlesSketch}
								alt="Hand drawn light bulb"
								width={320}
								height={153}
							/>
						</Link>
						<h2>Framework Principles</h2>
						<p>
							If you are curious about why some of decisions behind the framework were
							made, read the guiding principles for 10up Headless Framework.
						</p>
						<Link className={styles.gridLink} to="/philosophy">
							Read
						</Link>
					</article>
				</section>

				<hr />

				{/* <section className="gotQuestions">
					<h2>Got a question?</h2>
					<div className="gotQuestions__wrapper">
						<img
							src={gotQuestionsImage}
							alt=""
							className="gotQuestions__image"
							width={663}
							height={250}
						/>
					</div>

					<Link
						className={styles.gridLink}
						href="https://github.com/10up/gutenberg-best-practices/discussions"
					>
						Head to our Discussions board
					</Link>
  </section>

				<section className="content-wrapper">
					<div className="contributing">
						<header className="contributing__heading">
							<h2>You can help us grow our pool of knowledge</h2>
						</header>
						<div className="contributing__grid">
							<div className="contributing__half">
								<img
									src={contribBlock}
									srcSet={`${contribBlock2x} 2x`}
									width={500}
									height={89}
									alt="10up block components GitHub Read me introduction"
								/>
								<p>
									Contribute to the{' '}
									<Link
										className={styles.gridLink}
										to="https://github.com/10up/block-components"
									>
										block components
									</Link>
								</p>
							</div>
							<div className="contributing__half">
								<img
									src={contribDocs}
									srcSet={`${contribDocs2x} 2x`}
									width={500}
									height={89}
									alt="Open pull request in the docs project in Github"
								/>
								<p>
									Edit this{' '}
									<Link
										className={styles.gridLink}
										to="https://github.com/10up/gutenberg-best-practices"
									>
										documentation
									</Link>
								</p>
							</div>
							<div className="contributing__full">
								<img
									src={contribScaffold}
									srcSet={`${contribScaffold2x} 2x`}
									width={1040}
									height={376}
									alt="List of open pull requests for WP Scaffold in Github"
								/>
								<p>
									Expand the{' '}
									<Link
										className={styles.gridLink}
										to="https://github.com/10up/wp-scaffold"
									>
										WP Scaffold theme
									</Link>
								</p>
							</div>
						</div>
					</div>
				</section> */}
			</main>
		</Layout>
	);
}
