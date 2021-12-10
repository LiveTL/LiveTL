import sha256 from 'crypto-js/sha256';
import base64 from 'crypto-js/enc-base64';
import utf8 from 'crypto-js/enc-utf8';
import { config } from './auth-config';
import axios from 'axios';
import type WordArray from 'crypto-js/lib-typedarrays';

// https://gist.github.com/alexdiliberto/39a4ad0453310d0a69ce
function randomBytes(size: number): string {
  const QUOTA = 65536;
  const a = new Uint8Array(size);
  for (let i = 0; i < size; i += QUOTA) {
    crypto.getRandomValues(a.subarray(i, i + Math.min(QUOTA, size - i)));
  }
  return a.join('');
}

function base64URLEncode(str: string | WordArray): string {
  const wordArray = typeof str === 'string' ? utf8.parse(str) : str;
  return base64.stringify(wordArray)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

interface TokenResult {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

function isTokenResult(obj: any): obj is TokenResult {
  return (
    obj.access_token !== undefined &&
    obj.refresh_token !== undefined &&
    obj.id_token !== undefined &&
    obj.token_type !== undefined &&
    obj.expires_in !== undefined
  );
}

export async function authenticate(): Promise<TokenResult> {
  const verifier = base64URLEncode(randomBytes(32));
  const challenge = base64URLEncode(sha256(verifier).toString());

  const authOptions = {
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: 'offline_access openid profile email'
  };

  const authUrl = `https://${config.domain}/authorize?${new URLSearchParams(authOptions).toString()}`;

  const resultUrl: string | undefined = await new Promise((resolve) => {
    chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true
    }, resolve);
  });

  if (resultUrl == null || resultUrl === '') throw new Error('Auth failed. No result URL.');

  const code = new URL(resultUrl).searchParams.get('code');

  if (code == null) throw new Error('Auth failed. No code.');

  const body = JSON.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    code_verifier: verifier,
    client_id: config.clientId
  });

  const result = await axios.post(`https://${config.domain}/oauth/token`, body, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (result.status !== 200) throw new Error('Auth failed. Post failed.');
  if (!isTokenResult(result.data)) throw new Error('Auth failed. Invalid result.');

  return result.data;
}

export async function refresh(refreshToken: string): Promise<TokenResult> {
  const body = JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId
  });

  const result = await axios.post(`https://${config.domain}/oauth/token`, body, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (result.status !== 200) throw new Error('Refresh failed. Post failed.');
  if (!isTokenResult(result.data)) throw new Error('Refresh failed. Invalid result.');

  return result.data;
}
