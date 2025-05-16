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

export function getCompletions(document: TextDocument, position: { line: number; character: number }): CompletionItem[] {
  const text = document.getText();
  // 收集已出现的字段
  const usedFields = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^(\w+):/);
    if (match) {
      usedFields.add(match[1]);
    }
  }
  // 只补全未出现的字段
  const lineText = document.getText({
    start: { line: position.line, character: 0 },
    end: position
  });
  const match = lineText.match(/^(\s*)(\w*)$/);
  if (match) {
    const prefix = match[2];
    return FIELDS
      .filter(f => !usedFields.has(f) && f.startsWith(prefix))
      .map(f => ({
        label: f + ':',
        kind: CompletionItemKind.Field,
        insertText: f + ': '
      }));
  }
  return [];
}

export function getHover(document: TextDocument, position: { line: number; character: number }): Hover | undefined {
  const line = document.getText({
    start: { line: position.line, character: 0 },
    end: { line: position.line, character: position.character }
  });
  const word = line.split(/\s/).pop()?.replace(':', '');
  if (FIELDS.includes(word)) {
    return {
      contents: { kind: 'markdown', value: `**${word}** 是 TiddlyWiki 字段` }
    };
  }
  return undefined;
}

export function getDiagnostics(document: TextDocument): Diagnostic[] {
  const text = document.getText();
  const diagnostics: Diagnostic[] = [];
  if (!/^title:/m.test(text)) {
    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      message: '缺少 title 字段',
      source: 'tiddlywiki'
    });
  }
  return diagnostics;
}