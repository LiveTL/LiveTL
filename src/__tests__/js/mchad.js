/* eslint-disable no-undef */
import { getRoomTagLanguageCode } from '../../js/mchad.js';

it.each([
  ['en', 'en'],
  ['eng', 'en'],
  ['Français', 'fr'],
  ['日本語', 'jp'],
  ['es -> en', 'en'],
  ['', null],
  ['lalala lalala', null]
])('getRoomTagLanguageCode("%s") == %s', (tag, expected) => {
  expect(getRoomTagLanguageCode(tag)).toEqual(expected);
});
