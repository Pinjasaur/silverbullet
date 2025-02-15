import { syntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";

class InlineImageWidget extends WidgetType {
  constructor(readonly url: string, readonly title: string) {
    super();
  }

  eq(other: InlineImageWidget) {
    return other.url === this.url && other.title === this.title;
  }

  toDOM() {
    const img = document.createElement('img')
    img.src = this.url;
    img.alt = this.title;
    img.title = this.title;
    img.style.display = 'block';

    return img;
  }
}

const inlineImages = (view: EditorView) => {
  let widgets: Range<Decoration>[] = [];
  const imageRegex = /!\[(?<title>[^\]]*)\]\((?<url>.+)\)/;

  for (let {from, to} of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from, to,
      enter: (node) => {
        if (node.name !== 'Image') {
          return
        }
        
        const imageRexexResult = imageRegex.exec(view.state.sliceDoc(node.from, node.to));
        if (imageRexexResult === null || !imageRexexResult.groups) {
          return;
        }
        
        const url = imageRexexResult.groups.url;
        const title = imageRexexResult.groups.title;
        let deco = Decoration.widget({
          widget: new InlineImageWidget(url, title),
        });
        widgets.push(deco.range(node.to));
      }
    });
  }

  return Decoration.set(widgets, true);
}

export const inlineImagesPlugin = () =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = inlineImages(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged) {
          this.decorations = inlineImages(update.view);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
