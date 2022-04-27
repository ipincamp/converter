/**
 * @name converter
 * @version v0.0.1
 * @license GPL-2.0
 * @author ipincamp <support@nur-arifin.my.id>
 */

/* eslint-disable no-console */
import cp from 'child_process';
import cryptoJs from 'crypto-js';
import dotenv from 'dotenv';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs';

dotenv.config({ path: `${process.cwd()}\\.env` });

/**
 *
 * @param {string} text
 * @param {string | number} pass
 * @returns {string | null} Decrypted text
 */
export function decrypt(text, pass = process.env.PASS_TOKEN) {
  try {
    const bytes = cryptoJs.AES.decrypt(text, pass);
    return bytes.toString(cryptoJs.enc.Utf8);
  } catch {
    return null;
  }
}

/**
 *
 * @param {string} text
 * @param {string | number} pass
 * @returns {string} Encrypted text
 */
export function encrypt(text, pass = process.env.PASS_TOKEN) {
  return cryptoJs.AES.encrypt(text, pass).toString();
}

/**
 *
 * @param {string} mimeType
 * @returns {string} Extension media
 */
export function ext(mimeType) {
  return mimeType?.split('o/')[1];
}

/**
 *
 * @param {string} dir
 * @param {string} aud
 * @param {string} vid
 * @param {string} out
 * @param {import('express').Response} res
 * @returns Files output or error
 */
export function merger(dir, aud, vid, out, res) {
  if (fs.existsSync(out)) {
    /**
     * If you want the file to be directly downloaded
     *
     * return res.download(out);
     */
    return res.sendFile(out);
  }
  if (!fs.existsSync(aud) || !fs.existsSync(vid)) {
    return res.status(404).send(`
    <h2>File Not Found</h2>
    <p>
      File has been deleted. You can <a href="/">re-upload</a> to get a new token.
    </p>
    `);
  }
  const fill = '-map 0:v -map 1:a -c:v copy -c:a libmp3lame -b:a 192k -ar 44100';
  cp.exec(
    `${ffmpegPath} -y -i ${vid} -i ${aud} ${fill} -ac 2 -f mp4 ${out}`,
    (e) => {
      if (e) {
        fs.rm(dir, {
          force: true,
          recursive: true,
        }, function (er) {
          if (er) {
            console.error(er?.message);
          }
        });
        return res.status(500).send(`
        <h2>Error In Merging</h2>
        <p>
          Make sure the file you uploaded is correct, and please <a href="/">re-upload</a> it.
        </p>
        `);
      }
      fs.rm(aud, function (err) {
        if (err) {
          console.error(err?.message);
        }
      });
      fs.rm(vid, function (err) {
        if (err) {
          console.error(err?.message);
        }
      });
      /**
       *
       * If you want the file to be directly downloaded
       *
       * return res.download(out);
       */
      return res.sendFile(out);
    },
  );
}

/**
 *
 * @returns {string} Random word (length 15)
 */
export function random() {
  const a = () => Math.random().toString(36).substring(2);
  const b = a() + a();
  return b.slice(-15).toUpperCase();
}

/**
 *
 * @returns {number} Current time in minutes
 */
export function timer() {
  const now = new Date();
  const m2m = now.getMinutes();
  const h2m = now.getHours() * 60;
  return m2m + h2m;
}

/**
 * @returns Delete expired folders
 */
export function remover() {
  const dir = `${process.cwd()}\\resources`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.readdirSync(dir).forEach((path) => {
    const id = parseInt(path.split('-')[0]);
    if (id < timer()) {
      fs.rm(`${dir}\\${path}`, {
        force: true,
        recursive: true,
      }, function (err) {
        if (err) {
          return console.error(err?.message);
        }
      });
    }
  });
}
