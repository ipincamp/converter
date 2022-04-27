/**
 * @name converter
 * @version v0.0.1
 * @license GPL-2.0
 * @author ipincamp <support@nur-arifin.my.id>
 */

import { existsSync } from 'fs';
import { decrypt, merger } from './utils.js';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export default function putToken(req, res) {
  const { token } = req.query;

  const data = decrypt(token);

  if (data === null) {
    return res.status(404).send(`
    <h3>Invalid Token</h3>
    <p>
      Please re-check the token you entered.
      You can <a href="/">re-upload</a> to get a new token.
    </p>
    `);
  }

  const dir = `${process.cwd()}\\resources`;
  const path = `${dir}\\${data?.split('&a=')[0]}`;
  const aud = `${path}\\a.${data?.split('&a=')[1]?.split('&v=')[0]}`;
  const vid = `${path}\\v.${data?.split('&v=')[1]}`;

  if (!existsSync(path)) {
    return res.status(404).send(`
    <h3>Token Expired</h3>
    <p>
      An error occurred in the token, maybe the token was changed
      or has expired.
    </p>
    <p>
      After 15 minutes, we will automatically delete your files.
      Please <a href="/">re-upload</a> to get new tokens.
    </p>
    `);
  }

  merger(path, aud, vid, `${path}\\o.mp4`, res);
}
