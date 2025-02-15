import { syscall } from "./syscall";
import { PageMeta } from "../common/types";

export async function listPages(unfiltered = false): Promise<PageMeta[]> {
  return syscall("space.listPages", unfiltered);
}

export async function getPageMeta(
  name: string
): Promise<{ text: string; meta: PageMeta }> {
  return syscall("space.getPageMeta", name);
}

export async function readPage(
  name: string
): Promise<{ text: string; meta: PageMeta }> {
  return syscall("space.readPage", name);
}

export async function writePage(name: string, text: string): Promise<PageMeta> {
  return syscall("space.writePage", name, text);
}

export async function deletePage(name: string): Promise<PageMeta> {
  return syscall("space.deletePage", name);
}
