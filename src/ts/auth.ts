import sha256 from 'crypto-js/sha256';
import { config } from './auth-config';
import axios from 'axios';
import type { AxiosResponse } from 'axios';

// https://gist.github.com/alexdiliberto/39a4ad0453310d0a69ce
function randomBytes(size: number): Buffer {
  const QUOTA = 65536;
  const a = new Uint8Array(size);
  for (let i = 0; i < size; i += QUOTA) {
    crypto.getRandomValues(a.subarray(i, i + Math.min(QUOTA, size - i)));
  }
  return Buffer.from(a);
}

function base64URLEncode(str: any): string {
  return str.toString('base64')
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

export async function authenticate(): Promise<TokenResult> {
  const verifier = base64URLEncode(randomBytes(32));
  const challenge = base64URLEncode(sha256(verifier));

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

  if (resultUrl == null || resultUrl === '') throw new Error('Authorization failed. No result URL.');

  const code = new URL(resultUrl).searchParams.get('code');

  if (code == null) throw new Error('Authorization failed. No code.');

  const body = JSON.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    code_verifier: verifier,
    client_id: config.clientId
  });

  const result: AxiosResponse<TokenResult, any> = await axios.post(`https://${config.domain}/oauth/token`, body, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (result.status !== 200) throw new Error('Authorization failed. Post failed.');

  return result.data;
}
