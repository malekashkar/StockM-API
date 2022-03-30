import { config as dotenv } from 'dotenv';
import { Router } from 'express';
import fetch from 'node-fetch';
import qs from 'qs';
import { Oauth2UserModel } from '../models/oauth2User';
import { AccessTokenResponse } from '../types';
import { FetchError } from '../util';
import { getMember, getUser } from '../util/discord';

dotenv();

const DISCORD_API_BASE_URL = "https://discord.com/api/v6";
const OAUTH2_BASE_URL = process.env.OAUTH2_BASE_URL as string;
const OAUTH2_CLIENT_ID = process.env.OAUTH2_CLIENT_ID as string;
const OAUTH2_CLIENT_SECRET = process.env.OAUTH2_CLIENT_SECRET as string;
const OAUTH2_SCOPES = process.env.OAUTH2_SCOPES as string;

const GUILD_ID = process.env.GUILD_ID as string;
const MEMBER_ROLE_ID = process.env.MEMBER_ROLE_ID as string;

export default async function () {
  const router = Router();

  router.get('/', (req, res) => {
    const { oauthToken } = req.cookies;
    if (oauthToken) {
      return res.redirect('/dashboard');
    }
    return res.redirect(
      `https://discord.com/api/oauth2/authorize?client_id=${OAUTH2_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        `${OAUTH2_BASE_URL}/redirect`
      )}&response_type=code&scope=${encodeURIComponent(OAUTH2_SCOPES)}`
    );
  });

  router.get('/logout', (req, res) => {
    res.clearCookie('oauthToken');
    res.redirect('/login');
  });

  router.get('/@me', async (req, res) => {
    if (!req.cookies.oauthToken) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }

    try {
      const oauth2User = await Oauth2UserModel.findOne({
        'tokenDetails.accessToken': req.cookies.oauthToken,
        'tokenDetails.expiresAt': { $gt: new Date() },
      });

      if (!oauth2User) {
        res.clearCookie('oauthToken');
        return res.redirect('/login');
      }

      const meResponseJson = await getUser(
        '@me',
        req.cookies.oauthToken.toString()
      );

      if (oauth2User.isMember) 
        return res.status(200).json({
          ...meResponseJson,
          isMember: oauth2User.isMember,
        });

      return res.status(403).json({ code: 403, message: 'Forbidden' });
    } catch (err) {
      if (err instanceof FetchError) {
        console.error(err.message, await err.response.text());
      }
      console.error(err);
      return res
        .status(500)
        .send('Something went wrong. Please refresh this page.');
    }
  });

  router.get('/redirect', async (req, res) => {
    if (req.query.code) {
      const tokenExchangeResponse = await fetch(
        `${DISCORD_API_BASE_URL}/oauth2/token`,
        {
          body: qs.stringify({
            client_id: OAUTH2_CLIENT_ID,
            client_secret: OAUTH2_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: `${OAUTH2_BASE_URL}/redirect`,
            scope: OAUTH2_SCOPES,
            code: req.query.code.toString(),
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          method: 'POST',
        }
      );
      if (tokenExchangeResponse.ok) {
        const tokenExchangeResponseJson = (await tokenExchangeResponse.json()) as AccessTokenResponse;
        try {
          const meResponseJson = await getUser(
            '@me',
            tokenExchangeResponseJson.access_token
          );
          const oauth2User = await Oauth2UserModel.getOrCreate(
            meResponseJson.id
          );
          try {
            const memberResponseJson = await getMember(
              GUILD_ID,
              meResponseJson.id
            );
            oauth2User.isMember = memberResponseJson.roles.includes(MEMBER_ROLE_ID);
          } catch {}
          oauth2User.serializeUserResponse(meResponseJson);
          oauth2User.serializeAccessTokenResponse(tokenExchangeResponseJson);
          await oauth2User.save();
          res.cookie('oauthToken', tokenExchangeResponseJson.access_token);
          return res.redirect('/dashboard');
        } catch (err) {
          if (err instanceof FetchError) {
            console.error(err.message, await err.response.text());
          }
          console.error(err);
          return res
            .status(500)
            .send('Something went wrong. Please refresh this page.');
        }
      } else {
        console.log(tokenExchangeResponse.status);
        console.log(await tokenExchangeResponse.text());
        return res.redirect('/api/auth');
      }
    }
    return res.redirect('/dashboard');
  });

  return router;
}
