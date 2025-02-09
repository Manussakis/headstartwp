import {
	getSiteBySourceUrl,
	getCustomTaxonomies,
	asyncForEach,
	getCustomPostType,
	ConfigError,
	NotFoundError,
	addQueryArgs,
	getCustomTaxonomy,
} from '../../utils';
import { endpoints, getPostAuthor, getPostTerms, removeFieldsFromPostRelatedData } from '../utils';
import { apiGet } from '../api';
import { AuthorEntity, PostEntity, QueriedObject, TermEntity } from '../types';
import { postsMatchers } from '../utils/matchers';
import { parsePath } from '../utils/parsePath';
import {
	FetchOptions,
	AbstractFetchStrategy,
	EndpointParams,
	FetchResponse,
	FilterDataOptions,
} from './AbstractFetchStrategy';
import { removeFields } from '../utils/dataFilter';

const authorsEndpoint = '/wp-json/wp/v2/users';

/**
 * The EndpointParams supported by the {@link PostsArchiveFetchStrategy}
 */
export interface PostsArchiveParams extends EndpointParams {
	/**
	 * Current page of the collection.
	 *
	 * @default 1
	 */
	page?: number;

	/**
	 * If set will filter results by the specified category name
	 *
	 * It supports both a category id and category slug
	 */
	category?: string | number | number[];

	/**
	 * If set will filter results by the specified tag name
	 *
	 * It supports both a category id and category slug
	 */
	tag?: number | string;

	/**
	 * If set will filter results by the specified year
	 */
	year?: string;

	/**
	 * If set will filter results by the specified month
	 */
	month?: string;

	/**
	 * If set will filter results by the specified day
	 */
	day?: string;

	/**
	 * Maximum number of items to be returned in result set.
	 *
	 * @default 10
	 */
	per_page?: number;

	/**
	 * Limit results to those matching a string.
	 */
	search?: string;

	/**
	 * Limit result set to posts assigned to specific authors.
	 */
	author?: number | number[] | string;

	/**
	 * Ensure result set excludes posts assigned to specific authors.
	 */
	author_exclude?: number | number[];

	/**
	 * Ensure result set excludes specific IDs.
	 */
	exclude?: number[];

	/**
	 * Limit result set to specific IDs.
	 */
	include?: number[];

	/**
	 * Offset the result set by a specific number of items.
	 */
	offset?: number;

	/**
	 * Order sort attribute ascending or descending.
	 *
	 * @default 'desc'
	 */
	order?: 'asc' | 'desc';

	/**
	 * The post type to query for.
	 *
	 * @default 'post'
	 */
	postType?: string;

	/**
	 * Limit result set to posts with one or more specific slugs.
	 */
	slug?: string | string[];

	/**
	 * Sort collection by object attribute.
	 *
	 * @default 'date'
	 */
	orderby?:
		| 'author'
		| 'date'
		| 'id'
		| 'include'
		| 'modified'
		| 'parent'
		| 'relevance'
		| 'slug'
		| 'include_slugs'
		| 'title';

	/**
	 * Limit result set to posts assigned one or more statuses.
	 *
	 * @default 'publish'
	 */
	status?: string | string[];

	/**
	 * Limit result set based on relationship between multiple taxonomies.
	 */
	tax_relation?: 'AND' | 'OR';

	/**
	 * Limit result set to all items that have the specified term assigned in the categories taxonomy.
	 */
	categories?: number | number[] | string | string[];

	/**
	 * Limit result set to all items except those that have the specified term assigned in the categories taxonomy.
	 */
	categories_exclude?: number | number[];

	/**
	 * Limit results to a specific taxonomy and expects the actual term slug to come from the url]
	 *
	 * If you only specify the taxonomy, the term slug will be assumed to be the first segment of the path
	 */
	taxonomy?: string;

	/**
	 * Limit result set to all items that have the specified term assigned in the tags taxonomy.
	 */
	tags?: number | number[] | string | string[];

	/**
	 * Limit result set to all items except those that have the specified term assigned in the tags taxonomy.
	 */
	tags_exclude?: number | number[];

	/**
	 * Limit result set to items that are sticky.
	 */
	sticky?: boolean;
}

/**
 * The PostsArchiveFetchStrategy is used to fetch a collection of posts from any post type.
 * Note that custom post types and custom taxonomies should be defined in `headless.config.js`
 *
 * This strategy supports extracting endpoint params from url E.g:
 * - `/category/cat-name/page/2` maps to `{ category: 'cat-name', page: 2 }`
 * - `/page/2/` maps to `{ page: 2 }`
 * - `/genre/genre-name/page/2` maps to `{ genre: 'genre-name', page: 2 }` if a `genre` taxonomy is defined in `headless.config.js`
 *
 * @see {@link getParamsFromURL} to learn about url param mapping
 *
 * @category Data Fetching
 */
export class PostsArchiveFetchStrategy<
	T extends PostEntity = PostEntity,
	P extends PostsArchiveParams = PostsArchiveParams,
> extends AbstractFetchStrategy<T[], P> {
	getDefaultEndpoint(): string {
		return endpoints.posts;
	}

	getDefaultParams(): Partial<P> {
		return { _embed: true, ...super.getDefaultParams() } as P;
	}

	/**
	 * This strategy automatically extracts taxonomy filters, date filters and pagination params from the URL
	 *
	 * It also takes into account the custom taxonomies specified in `headless.config.js`
	 *
	 * @param path The URL path to extract params from
	 * @param params
	 */
	getParamsFromURL(path: string, params: Partial<P> = {}): Partial<P> {
		const matchers = [...postsMatchers];

		if (typeof params.taxonomy === 'string') {
			const taxonomyObj = getCustomTaxonomy(params.taxonomy, this.baseURL);

			if (!taxonomyObj) {
				throw new ConfigError(`Taxonomy "${params.taxonomy}" not found`);
			}

			const taxonomy = taxonomyObj.rewrite ?? taxonomyObj.slug;

			const taxonomyMatchers = matchers
				.filter((matcher) => matcher.name !== 'date' && !matcher.name.includes('author'))
				.map((matcher) => ({
					...matcher,
					name: `${matcher.name}-taxonomy`,
					pattern: `/(.*)?/:${taxonomy}${matcher.pattern}`,
				}));

			taxonomyMatchers.push({
				name: 'taxonomy-term-slug',
				priority: 30,
				pattern: `/(.*)?/:${taxonomy}`,
			});

			return parsePath(taxonomyMatchers, path) as Partial<P>;
		}

		const customTaxonomies = getCustomTaxonomies(this.baseURL);
		customTaxonomies?.forEach((taxonomy) => {
			const slug = taxonomy?.rewrite ?? taxonomy.slug;
			matchers.push({
				name: taxonomy.slug,
				priority: 30,
				pattern: `/${slug}/:${slug}`,
			});

			matchers.push({
				name: `${taxonomy.slug}-with-pagination`,
				priority: 30,
				pattern: `/${slug}/:${slug}/page/:page`,
			});
		});

		return parsePath(matchers, path) as Partial<P>;
	}

	/**
	 * Handles taxonomy filters and switch endpoint based on post type
	 *
	 * @param params The params to build the endpoint with
	 */
	buildEndpointURL(params: Partial<P>) {
		const settings = getSiteBySourceUrl(this.baseURL);

		// these params should be disregarded when building out the endpoint
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { category, tag, postType, taxonomy, ...endpointParams } = params;

		const taxonomies = getCustomTaxonomies(this.baseURL);

		taxonomies.forEach((taxonomy) => {
			const slug = taxonomy.rewrite ?? taxonomy.slug;
			if (endpointParams[slug]) {
				delete endpointParams[slug];
			}
		});

		if (params.postType) {
			const postType = getCustomPostType(params.postType, this.baseURL);

			if (!postType) {
				throw new ConfigError(
					'Unknown post type, did you forget to add it to headless.config.js?',
				);
			}

			this.setEndpoint(postType.endpoint);
		}

		// if an author slug was passed
		// and we're not using the WordPress plugin
		// we don't want to include it in the endpoint as is as we need to fetch the author id first.
		if (params.author && typeof params.author === 'string' && !settings.useWordPressPlugin) {
			delete endpointParams.author;
		}

		return super.buildEndpointURL(endpointParams as P);
	}

	/**
	 * Before fetching posts, we need handle taxonomy and authors.
	 *
	 * If the headless plugin is not being used, then additional requests needs to be made to get
	 * authors and terms ids
	 *
	 * @param url The URL to parse
	 * @param params The params to build the endpoint with
	 * @param options FetchOptions
	 */
	async fetcher(url: string, params: Partial<P>, options: Partial<FetchOptions> = {}) {
		const { burstCache = false } = options;
		let finalUrl = url;
		const settings = getSiteBySourceUrl(this.baseURL);

		const customTaxonomies = getCustomTaxonomies(this.baseURL);
		if (customTaxonomies) {
			await asyncForEach(customTaxonomies, async (taxonomy) => {
				const paramSlug = taxonomy?.rewrite ?? taxonomy.slug;
				const restParam = taxonomy?.restParam ?? taxonomy.slug;

				if (!params[paramSlug]) {
					return;
				}

				if (settings.useWordPressPlugin) {
					// WordPress plugin extends the REST API to accept a category slug instead of just an id
					finalUrl = addQueryArgs(finalUrl, { [restParam]: params[paramSlug] });
				} else {
					const terms = await apiGet(
						`${this.baseURL}${taxonomy.endpoint}?slug=${params[paramSlug]}`,
						{},
						burstCache,
					);

					if (terms.json.length > 0) {
						finalUrl = addQueryArgs(finalUrl, {
							[restParam]: terms.json[0].id,
						});
					} else {
						throw new NotFoundError(
							`Term "${params[paramSlug]}" from "${taxonomy.slug}" has not been found`,
						);
					}
				}
			});
		}

		// check if we need to fetch author id
		// we need to fetch author id if
		// 1 - params.author is a string
		// 2 - We're not using the WP Plugin
		if (params.author && typeof params.author === 'string' && !settings.useWordPressPlugin) {
			const authors = await apiGet(
				`${this.baseURL}${authorsEndpoint}?slug=${params.author}`,
				{},
				burstCache,
			);

			if (authors.json.length > 0) {
				finalUrl = addQueryArgs(finalUrl, {
					author: authors.json[0].id,
				});
			} else {
				throw new NotFoundError(`Author "${params.author}" not found`);
			}
		}

		return super.fetcher(finalUrl, params, options);
	}

	/**
	 * Returns the queried object if applicable (e.g if querying by category, tag, author or custom taxonomy term)
	 *
	 * @param response The response from the API
	 * @param params  The request params
	 * @returns
	 */
	getQueriedObject(response: FetchResponse<T[]>, params: Partial<P>) {
		const queriedObject: QueriedObject = {};

		if (!Array.isArray(response.result)) {
			return queriedObject;
		}

		const posts = response.result.map((post) => {
			return { ...post, author: getPostAuthor(post), terms: getPostTerms(post) };
		});

		if (params.author && posts[0].author) {
			const queriedAuthor = posts[0].author.find((author) => {
				if (typeof params.author === 'number') {
					return author.id === params.author;
				}

				if (typeof params.author === 'string' && typeof author.slug === 'string') {
					return decodeURIComponent(author.slug) === decodeURIComponent(params.author);
				}

				if (Array.isArray(params.author)) {
					return params.author.includes(author.id);
				}

				return false;
			});

			if (queriedAuthor) {
				queriedObject.author = queriedAuthor;
			}
		}

		const taxonomies = getCustomTaxonomies();

		taxonomies.forEach((taxonomy) => {
			const termSlug = taxonomy.slug;
			const urlParamSlug = taxonomy.rewrite ?? taxonomy.slug;
			const termValue = params[urlParamSlug];

			if (termValue && posts[0]?.terms?.[termSlug]) {
				const queriedTerm = posts[0]?.terms?.[termSlug].find((term) => {
					if (typeof termValue === 'string') {
						return (
							decodeURIComponent((term.slug as string) ?? '') ===
							decodeURIComponent((termValue as string) ?? '')
						);
					}

					if (typeof termValue === 'number') {
						return Number(term.id) === Number(termValue);
					}

					if (Array.isArray(termValue)) {
						return termValue.includes(term.id);
					}

					return false;
				});

				if (queriedTerm) {
					queriedObject.term = queriedTerm;
				}
			}
		});

		return queriedObject;
	}

	filterData(data: FetchResponse<T[]>, options?: FilterDataOptions<T[]>): FetchResponse<T[]> {
		if (typeof options !== 'undefined') {
			return super.filterData(data, options) as unknown as FetchResponse<T[]>;
		}

		const fieldsToRemove = ['_links'];

		const queriedObject = { ...data.queriedObject };

		if (queriedObject.author) {
			queriedObject.author = removeFields(
				fieldsToRemove,
				queriedObject.author,
			) as AuthorEntity;
		}

		if (queriedObject.term) {
			queriedObject.term = removeFields(fieldsToRemove, queriedObject.term) as TermEntity;
		}

		const result = (removeFields<T>(fieldsToRemove, data.result) as T[]).map((post) => {
			return removeFieldsFromPostRelatedData(fieldsToRemove, post);
		});

		return {
			...data,
			queriedObject,
			result: result as T[],
		};
	}
}
