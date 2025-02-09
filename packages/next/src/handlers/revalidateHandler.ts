import type { NextApiRequest, NextApiResponse } from 'next';
import { getHeadlessConfig, getSiteByHost, VerifyTokenFetchStrategy } from '@headstartwp/core';
import { fetchHookData } from '../data';

/**
 * The RevalidateHandler is responsible for handling revalidate requests.
 *
 * Handling revalidate requires the Headless WordPress Plugin.
 *
 * **Important**: This function is meant to be used in a api route e.g: `/pages/api/revalidate`.
 *
 * ### Usage
 *
 * ```ts
 * // pages/api/revalidate.js
 * import { revalidateHandler } from '@headstartwp/next';
 *
 * export default async function handler(req, res) {
 * 	return revalidateHandler(req, res);
 * }
 * ```
 *
 * @param req The request object,
 * @param res The response object.
 *
 * @returns A response object.
 *
 * @category API handlers
 */
export async function revalidateHandler(req: NextApiRequest, res: NextApiResponse) {
	const { post_id, path, token, locale } = req.query;

	if (req.method !== 'GET') {
		return res.status(401).json({ message: 'Invalid method' });
	}

	if (!path || !post_id || !token) {
		return res.status(401).json({ message: 'Missing required params' });
	}

	if (typeof path !== 'string' || typeof post_id !== 'string' || typeof token !== 'string') {
		return res.status(401).json({ message: 'Invalid params' });
	}

	const host = req.headers.host ?? '';
	const site = getSiteByHost(host, typeof locale === 'string' ? locale : undefined);
	const isMultisiteRequest = site !== null && typeof site.sourceUrl === 'string';
	const { sourceUrl } = isMultisiteRequest ? site : getHeadlessConfig();
	// call WordPress API to check token
	try {
		const { data } = await fetchHookData(
			new VerifyTokenFetchStrategy(sourceUrl),
			{
				params: {
					path: [],
					site: req.headers?.host,
				},
				locale: typeof locale === 'string' ? locale : undefined,
			},
			{
				params: {
					authToken: token,
				},
			},
		);

		const result = data.result as any;
		const verifiedPath = result.path ?? '';
		const verifiedPostId = result.post_id ?? 0;

		// make sure the path and post_id matches with what was encoded in the token
		if (verifiedPath !== path || Number(verifiedPostId) !== Number(post_id)) {
			throw new Error('Token mismatch');
		}

		let pathToRevalidate = path;

		if (isMultisiteRequest) {
			if (locale) {
				pathToRevalidate = `/_sites/${host}/${locale}/${path}`;
			}
			pathToRevalidate = `/_sites/${host}${path}`;
		}

		await res.revalidate(pathToRevalidate);
		return res.status(200).json({ message: 'success', path: pathToRevalidate });
	} catch (err) {
		let errorMessage = 'Error verifying the token';
		if (err instanceof Error) {
			errorMessage = err.message;
		}
		return res.status(500).json({ message: errorMessage });
	}
}
