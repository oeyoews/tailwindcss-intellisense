import {
  CompletionItem,
  CompletionItemKind,
  Hover,
  Diagnostic,
  DiagnosticSeverity
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

const FIELDS = [
  'title', 'tags', 'created', 'modified', 'type', 'text',
  'creator', 'modifier', 'list', 'caption', 'icon', 'color', 'description'
  // ...可继续添加
];

const FIELD_DESCRIPTIONS: Record<string, string> = {
  title: '条目的标题，必填字段',
  tags: '条目的标签，多个标签用空格分隔',
  created: '条目的创建时间',
  modified: '条目的最后修改时间',
  type: '条目的类型，如 text/vnd.tiddlywiki',
  text: '条目的正文内容',
  creator: '条目的创建者',
  modifier: '条目的最后修改者',
  list: '条目的列表字段',
  caption: '条目的显示标题',
  icon: '条目的图标',
  color: '条目的颜色',
  description: '条目的描述信息'
};

const WIKITEXT_SYNTAX = {
  macros: [
    { name: 'list', description: '创建一个列表，例如：`<<list filter:"[tag[tagName]]">>`' },
    { name: 'tabs', description: '创建标签页，例如：`<<tabs "Tab 1" "Tab 2">>`' },
    { name: 'button', description: '创建一个按钮，例如：`<<button "Click me">>`' },
    { name: 'link', description: '创建一个链接，例如：`<<link "Link text">>`' },
    { name: 'transclude', description: '嵌入其他条目，例如：`<<transclude "EntryName">>`' },
    { name: 'include', description: '包含其他条目，例如：`<<include "EntryName">>`' },
    { name: 'define', description: '定义变量，例如：`<<define $variable>>`' },
    { name: 'set', description: '设置变量，例如：`<<set $variable to "value">>`' }
  ],
  links: {
    internal: { pattern: '\\[\\[.*?\\]\\]', description: '内部链接，例如：`[[EntryName]]`' },
    external: { pattern: '\\[.*?\\]\\(.*?\\)', description: '外部链接，例如：`[Link text](url)`' }
  },
  formatting: {
    bold: { pattern: "''.*?''", description: '粗体文本，例如：`''bold text''`' },
    italic: { pattern: '//.*?//', description: '斜体文本，例如：`//italic text//`' },
    underline: { pattern: '__.*?__', description: '下划线文本，例如：`__underlined text__`' },
    strikethrough: { pattern: '~~.*?~~', description: '删除线文本，例如：`~~strikethrough text~~`' }
  }
};

export function getCompletions(document: TextDocument, position: { line: number; character: number }): CompletionItem[] {
  const text = document.getText();
  const lineText = document.getText({
    start: { line: position.line, character: 0 },
    end: position
  });

  // 字段补全
  const usedFields = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^(\w+):/);
    if (match) {
      usedFields.add(match[1]);
    }
  }

  const fieldMatch = lineText.match(/^(\s*)(\w*)$/);
  if (fieldMatch) {
    const prefix = fieldMatch[2];
    return FIELDS
      .filter(f => !usedFields.has(f) && f.startsWith(prefix))
      .map(f => ({
        label: f + ':',
        kind: CompletionItemKind.Field,
        insertText: f + ': ',
        detail: FIELD_DESCRIPTIONS[f] || 'TiddlyWiki 字段',
        documentation: {
          kind: 'markdown',
          value: `**${f}**\n\n${FIELD_DESCRIPTIONS[f] || 'TiddlyWiki 字段'}`
        }
      }));
  }

  // Wikitext 补全
  const macroMatch = lineText.match(/<<(\w*)$/);
  if (macroMatch) {
    const prefix = macroMatch[1];
    return WIKITEXT_SYNTAX.macros
      .filter(m => m.name.startsWith(prefix))
      .map(m => ({
        label: m.name,
        kind: CompletionItemKind.Snippet,
        insertText: `${m.name} "$1">>`,
        insertTextFormat: 2, // Snippet format
        detail: m.description,
        documentation: {
          kind: 'markdown',
          value: `**${m.name}**\n\n${m.description}`
        }
      }));
  }

  // 链接补全
  const linkMatch = lineText.match(/\[\[(.*?)$/);
  if (linkMatch) {
    // 这里可以添加内部条目的补全
    return [];
  }

  return [];
}

export function getHover(document: TextDocument, position: { line: number; character: number }): Hover | undefined {
  const line = document.getText({
    start: { line: position.line, character: 0 },
    end: { line: position.line, character: position.character }
  });

  // 字段悬浮提示
  const fieldMatch = line.match(/(\w+):$/);
  if (fieldMatch) {
    const field = fieldMatch[1];
    if (FIELDS.includes(field)) {
      return {
        contents: {
          kind: 'markdown',
          value: `**${field}**\n\n${FIELD_DESCRIPTIONS[field] || 'TiddlyWiki 字段'}`
        }
      };
    }
  }

  // Wikitext 语法悬浮提示
  const macroMatch = line.match(/<<(\w+)/);
  if (macroMatch) {
    const macro = macroMatch[1];
    const macroInfo = WIKITEXT_SYNTAX.macros.find(m => m.name === macro);
    if (macroInfo) {
      return {
        contents: {
          kind: 'markdown',
          value: `**${macro}**\n\n${macroInfo.description}`
        }
      };
    }
  }

  return undefined;
}

export function getDiagnostics(document: TextDocument): Diagnostic[] {
  const text = document.getText();
  const diagnostics: Diagnostic[] = [];

  // 检查必填字段
  if (!/^title:/m.test(text)) {
    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      message: '缺少 title 字段',
      source: 'tiddlywiki'
    });
  }

  // 检查 wikitext 语法
  const lines = text.split(/\r?\n/);
  lines.forEach((line, lineNum) => {
    // 检查未闭合的宏
    const openMacros = line.match(/<<[^>]*/g);
    if (openMacros) {
      openMacros.forEach(macro => {
        if (!line.includes('>>')) {
          diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: {
              start: { line: lineNum, character: line.indexOf(macro) },
              end: { line: lineNum, character: line.indexOf(macro) + macro.length }
            },
            message: `未闭合的宏: ${macro}`,
            source: 'tiddlywiki'
          });
        }
      });
    }
  });

  return diagnostics;
}