/**
 * @name converter
 * @version v0.0.1
 * @license GPL-2.0
 * @author ipincamp <support@nur-arifin.my.id>
 */

import fs from 'fs';
import * as p from './utils.js';

/**
 *
 * @param {import('express').Request} q
 * @param {import('express').Response} r
 */
export default function getToken(q, r) {
  if (!q.files || Object.keys(q.files).length === 0) {
    return r.status(400).send(`
    <h2>No Files Uploaded</h2>
    <p>
      Make sure the file you uploaded is correct, and please re-upload it.
    </p>
    `);
  }

  const { aud, vid } = q.files;

  if (aud === undefined || vid === undefined) {
    return r.status(400).send(`
    <h2>File Must Be Complete</h2>
    <p>
      Make sure the file you uploaded is correct, and please re-upload it.
    </p>
    `);
  }

  const audx = p.ext(aud.mimetype);
  const vidx = p.ext(vid.mimetype);

  if (audx === undefined || vidx === undefined) {
    return r.status(400).send('Could not find the correct extension of your file');
  }

  const path = `${p.timer() + 2}-${p.random()}`;
  const dir = `${process.cwd()}\\resources\\${path}`;
  const token = `${path}&a=${audx}&v=${vidx}`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  try {
    aud.mv(`${dir}\\a.${audx}`);
    vid.mv(`${dir}\\v.${vidx}`);
  } catch {
    return r.status(500).send('Something went wrong, try to re-upload');
  }

  r.status(200).send(`
  <h2>Token Successfully Generated!</h2>
  <label for="token">Your Token :</label>
  <input name="token" id="token" value="${p.encrypt(token)}" readonly>
  <button id="copybtn" onclick="copy()">Copy Token</button>
  <p>
    This token is used to access the <a href="/">results</a>
    you submitted and is only valid for 30 minutes after being generated.
  </p>
  <p><strong>This page is only shown once!</strong></p>
  <script>
    function copy() {
      var a = document.getElementById("token");
      a.select();
      a.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(a.value);
      var b = document.getElementById("copybtn");
      b.textContent = "Copied!";
      setTimeout(() => {
        b.textContent = "Copy Token";
      }, 1000);
    }
  </script>
  `);
}
