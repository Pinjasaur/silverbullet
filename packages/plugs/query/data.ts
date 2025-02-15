// Index key space:
// data:page@pos

import type { IndexTreeEvent } from "@silverbulletmd/web/app_event";
import {
  batchSet,
  queryPrefix,
} from "@silverbulletmd/plugos-silverbullet-syscall";
import {
  addParentPointers,
  collectNodesOfType,
  findNodeOfType,
  ParseTree,
  replaceNodesMatching,
} from "@silverbulletmd/common/tree";
import {
  parse as parseYaml,
  stringify as stringifyYaml,
  parseAllDocuments,
} from "yaml";
import type { QueryProviderEvent } from "./engine";
import { applyQuery } from "./engine";
import { removeQueries } from "./util";

export async function indexData({ name, tree }: IndexTreeEvent) {
  let dataObjects: { key: string; value: Object }[] = [];

  removeQueries(tree);

  collectNodesOfType(tree, "FencedCode").forEach((t) => {
    let codeInfoNode = findNodeOfType(t, "CodeInfo");
    if (!codeInfoNode) {
      return;
    }
    if (codeInfoNode.children![0].text !== "data") {
      return;
    }
    let codeTextNode = findNodeOfType(t, "CodeText");
    if (!codeTextNode) {
      // Honestly, this shouldn't happen
      return;
    }
    let codeText = codeTextNode.children![0].text!;
    try {
      // We support multiple YAML documents in one block
      for (let doc of parseAllDocuments(codeText)) {
        if (!doc.contents) {
          continue;
        }
        console.log(doc.contents.toJSON());
        dataObjects.push({
          key: `data:${name}@${t.from! + doc.range[0]}`,
          value: doc.contents.toJSON(),
        });
      }
      // console.log("Parsed data", parsedData);
    } catch (e) {
      console.error("Could not parse data", codeText, "error:", e);
      return;
    }
  });
  console.log("Found", dataObjects.length, "data objects");
  await batchSet(name, dataObjects);
}

export function extractMeta(
  parseTree: ParseTree,
  removeKeys: string[] = []
): any {
  let data: any = {};
  addParentPointers(parseTree);
  replaceNodesMatching(parseTree, (t) => {
    if (t.type === "Hashtag") {
      // Check if if nested directly into a Paragraph
      if (t.parent && t.parent.type === "Paragraph") {
        let tagname = t.children![0].text;
        if (!data.tags) {
          data.tags = [];
        }
        if (!data.tags.includes(tagname)) {
          data.tags.push(tagname);
        }
      }
      return;
    }
    // Find a fenced code block
    if (t.type !== "FencedCode") {
      return;
    }
    let codeInfoNode = findNodeOfType(t, "CodeInfo");
    if (!codeInfoNode) {
      return;
    }
    if (codeInfoNode.children![0].text !== "meta") {
      return;
    }
    let codeTextNode = findNodeOfType(t, "CodeText");
    if (!codeTextNode) {
      // Honestly, this shouldn't happen
      return;
    }
    let codeText = codeTextNode.children![0].text!;
    data = parseYaml(codeText);
    if (removeKeys.length > 0) {
      let newData = { ...data };
      for (let key of removeKeys) {
        delete newData[key];
      }
      codeTextNode.children![0].text = stringifyYaml(newData).trim();
      // If nothing is left, let's just delete this thing
      if (Object.keys(newData).length === 0) {
        return null;
      }
    }
    return undefined;
  });

  return data;
}

export async function queryProvider({
  query,
}: QueryProviderEvent): Promise<any[]> {
  let allData: any[] = [];
  for (let { key, page, value } of await queryPrefix("data:")) {
    let [, pos] = key.split("@");
    allData.push({
      ...value,
      page: page,
      pos: +pos,
    });
  }
  return applyQuery(query, allData);
}
