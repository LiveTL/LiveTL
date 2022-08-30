import { twitchClientId, twitchGQL } from './constants.js';

/**
 * Make a graphql fetch request for an auto-persisted query for twitch.
 *
 * Twitch uses https://www.apollographql.com/docs/apollo-server/performance/apq/
 *
 * It more or less does operationName(variables) on the server and returns response.
 * Hash has to be of the exact query, so you must get that from the network devtools.
 * It will stay the same regardless of variables.
 *
 * @param {string} operationName operationName from operationName(variables)
 * @param {Object<string, string>} variables variables from operationName(variables)
 * @param {string} hash the sha 256 hash of the original query
 * @return {ReturnType<fetch>}
 */
const gqlFetch = (operationName, variables, hash) => fetch(twitchGQL, {
  method: 'POST',
  headers: {
    'Client-Id': twitchClientId
  },
  body: JSON.stringify([
    {
      operationName,
      variables,
      extensions: { persistedQuery: { version: 1, sha256Hash: hash } }
    }
  ])
}).then(r => r.json()).then(json => json[0].data);

/** @type {(videoID: string) => Promise<string | null>} */
export const getStreamer = (videoID) => gqlFetch(
  'ChannelVideoCore',
  { videoID },
  'cf1ccf6f5b94c94d662efec5223dfb260c9f8bf053239a76125a58118769e8e2'
).then(data => data.video.owner.login).catch(() => null);

/** @type {(videoID: string, channelLogin?: string) => Promise<number | null>} */
export const getStartTime = async (videoID, channelLogin) => {
  if (channelLogin === undefined) {
    channelLogin = await getStreamer(videoID);
  }
  return await gqlFetch(
    'VideoMetadata',
    { channelLogin, videoID },
    '49b5b8f268cdeb259d75b58dcb0c1a748e3b575003448a2333dc5cdafd49adad'
  ).then(data => new Date(data.video.createdAt).getTime()).catch(() => null);
};

/** @type {(videoLink: string) => string} */
export const getVideoId = videoLink => {
  const parts = videoLink.split('/');
  return parts[parts.length - 1];
};

