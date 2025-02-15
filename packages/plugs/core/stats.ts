import {
  flashNotification,
  getText,
} from "@silverbulletmd/plugos-silverbullet-syscall/editor";
import { listPages } from "@silverbulletmd/plugos-silverbullet-syscall/space";

function countWords(str: string): number {
  const matches = str.match(/[\w\d\'-]+/gi);
  return matches ? matches.length : 0;
}

function readingTime(wordCount: number): number {
  // 225 is average word reading speed for adults
  return Math.ceil(wordCount / 225);
}

export async function statsCommand() {
  const text = await getText();
  const allPages = await listPages();
  const wordCount = countWords(text);
  const time = readingTime(wordCount);
  await flashNotification(
    `${wordCount} words; ${time} minutes read; ${allPages.length} total pages in space.`
  );
}
