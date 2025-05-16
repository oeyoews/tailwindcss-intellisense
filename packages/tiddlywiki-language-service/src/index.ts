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
  'creator', 'modifier', 'list', 'caption', 'icon', 'color', 'description',
  'module-type'
  // ...可继续添加
];

const SYSTEM_TYPES = [
  'text/vnd.tiddlywiki',
  'text/plain',
  'text/html',
  'text/x-markdown',
  'text/css',
  'application/javascript',
  'application/json',
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/gif',
  'application/pdf',
  'application/x-tiddler-dictionary',
  'application/x-tiddler-dictionary-json',
  'application/x-tiddler-html',
  'application/x-tiddler-html-json',
  'application/x-tiddler-text',
  'application/x-tiddler-text-json',
  'application/x-tiddler-wiki',
  'application/x-tiddler-wiki-json'
];

const SYSTEM_TAGS = [
  '$:/tags/TagsSheet'
];

const MODULE_TYPES = [
  'library',
  'subclass',
  'widget',
  'macro',
  'filter',
  'filteroperator',
  'filterrunprefix',
  'filterrunsuffix',
  'filterrunprefixoperator',
  'filterrunsuffixoperator',
  'filterrunprefixoperatorparameter',
  'filterrunsuffixoperatorparameter',
  'filterrunprefixoperatorparameterfirst',
  'filterrunsuffixoperatorparameterfirst',
  'filterrunprefixoperatorparameterlast',
  'filterrunsuffixoperatorparameterlast',
  'filterrunprefixoperatorparameterall',
  'filterrunsuffixoperatorparameterall',
  'filterrunprefixoperatorparameternone',
  'filterrunsuffixoperatorparameternone',
  'filterrunprefixoperatorparameterone',
  'filterrunsuffixoperatorparameterone',
  'filterrunprefixoperatorparametersome',
  'filterrunsuffixoperatorparametersome',
  'filterrunprefixoperatorparametermany',
  'filterrunsuffixoperatorparametermany',
  'startup',
  'global',
  'config',
  'theme',
  'palette',
  'plugin',
  'pluginlibrary',
  'pluginlibraryglobal',
  'pluginlibrarycontrolpanel',
  'pluginlibraryeditortoolbar',
  'pluginlibraryviewtoolbar',
  'pluginlibraryviewtemplate',
  'pluginlibrarystoryview',
  'pluginlibrarypagetemplate',
  'pluginlibrarystylesheet',
  'pluginlibraryjavascript',
  'pluginlibrarymacro',
  'pluginlibrarywidget',
  'pluginlibraryfilter',
  'pluginlibraryfilteroperator',
  'pluginlibraryfilterrunprefix',
  'pluginlibraryfilterrunsuffix',
  'pluginlibraryfilterrunprefixoperator',
  'pluginlibraryfilterrunsuffixoperator',
  'pluginlibraryfilterrunprefixoperatorparameter',
  'pluginlibraryfilterrunsuffixoperatorparameter',
  'pluginlibraryfilterrunprefixoperatorparameterfirst',
  'pluginlibraryfilterrunsuffixoperatorparameterfirst',
  'pluginlibraryfilterrunprefixoperatorparameterlast',
  'pluginlibraryfilterrunsuffixoperatorparameterlast',
  'pluginlibraryfilterrunprefixoperatorparameterall',
  'pluginlibraryfilterrunsuffixoperatorparameterall',
  'pluginlibraryfilterrunprefixoperatorparameternone',
  'pluginlibraryfilterrunsuffixoperatorparameternone',
  'pluginlibraryfilterrunprefixoperatorparameterone',
  'pluginlibraryfilterrunsuffixoperatorparameterone',
  'pluginlibraryfilterrunprefixoperatorparametersome',
  'pluginlibraryfilterrunsuffixoperatorparametersome',
  'pluginlibraryfilterrunprefixoperatorparametermany',
  'pluginlibraryfilterrunsuffixoperatorparametermany'
];

const MODULE_TYPE_DESCRIPTIONS: Record<string, string> = {
  'library': 'JavaScript 库模块，提供可重用的函数和类',
  'subclass': 'JavaScript 子类模块，用于扩展现有类',
  'widget': '自定义部件模块，用于创建新的 TiddlyWiki 部件',
  'macro': '宏模块，用于创建新的 TiddlyWiki 宏',
  'filter': '过滤器模块，用于创建新的 TiddlyWiki 过滤器',
  'filteroperator': '过滤器操作符模块，用于创建新的过滤器操作符',
  'filterrunprefix': '过滤器运行前缀模块，用于创建新的过滤器运行前缀',
  'filterrunsuffix': '过滤器运行后缀模块，用于创建新的过滤器运行后缀',
  'filterrunprefixoperator': '过滤器运行前缀操作符模块',
  'filterrunsuffixoperator': '过滤器运行后缀操作符模块',
  'filterrunprefixoperatorparameter': '过滤器运行前缀操作符参数模块',
  'filterrunsuffixoperatorparameter': '过滤器运行后缀操作符参数模块',
  'startup': '启动模块，在 TiddlyWiki 启动时执行',
  'global': '全局模块，提供全局变量和函数',
  'config': '配置模块，用于存储配置信息',
  'theme': '主题模块，用于定义 TiddlyWiki 主题',
  'palette': '调色板模块，用于定义颜色方案',
  'plugin': '插件模块，用于扩展 TiddlyWiki 功能',
  'pluginlibrary': '插件库模块，用于组织和管理插件'
};

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
  description: '条目的描述信息',
  'module-type': '模块类型，用于指定 JavaScript 模块的类型'
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
  'text/vnd.tiddlywiki': 'TiddlyWiki 原生格式，支持所有 TiddlyWiki 语法',
  'text/plain': '纯文本格式',
  'text/html': 'HTML 格式',
  'text/x-markdown': 'Markdown 格式',
  'text/css': 'CSS 样式表',
  'application/javascript': 'JavaScript 代码',
  'application/json': 'JSON 数据',
  'image/svg+xml': 'SVG 矢量图形',
  'image/png': 'PNG 图片',
  'image/jpeg': 'JPEG 图片',
  'image/gif': 'GIF 图片',
  'application/pdf': 'PDF 文档',
  'application/x-tiddler-dictionary': 'Tiddler 字典格式',
  'application/x-tiddler-dictionary-json': 'Tiddler 字典 JSON 格式',
  'application/x-tiddler-html': 'Tiddler HTML 格式',
  'application/x-tiddler-html-json': 'Tiddler HTML JSON 格式',
  'application/x-tiddler-text': 'Tiddler 文本格式',
  'application/x-tiddler-text-json': 'Tiddler 文本 JSON 格式',
  'application/x-tiddler-wiki': 'Tiddler Wiki 格式',
  'application/x-tiddler-wiki-json': 'Tiddler Wiki JSON 格式'
};

const TAG_DESCRIPTIONS: Record<string, string> = {
  '$:/tags/System': '系统标签，用于标记系统条目',
  '$:/tags/SystemInfo': '系统信息标签，用于标记系统信息条目',
  '$:/tags/SystemConfig': '系统配置标签，用于标记系统配置条目',
  '$:/tags/SystemTheme': '系统主题标签，用于标记系统主题条目',
  '$:/tags/SystemPalette': '系统调色板标签，用于标记系统调色板条目',
  '$:/tags/SystemPlugin': '系统插件标签，用于标记系统插件条目',
  '$:/tags/SystemPluginLibrary': '系统插件库标签，用于标记系统插件库条目',
  '$:/tags/SystemPluginLibrary/Global': '全局插件库标签',
  '$:/tags/SystemPluginLibrary/ControlPanel': '控制面板插件库标签',
  '$:/tags/SystemPluginLibrary/EditorToolbar': '编辑器工具栏插件库标签',
  '$:/tags/SystemPluginLibrary/ViewToolbar': '视图工具栏插件库标签',
  '$:/tags/SystemPluginLibrary/ViewTemplate': '视图模板插件库标签',
  '$:/tags/SystemPluginLibrary/StoryView': '故事视图插件库标签',
  '$:/tags/SystemPluginLibrary/PageTemplate': '页面模板插件库标签',
  '$:/tags/SystemPluginLibrary/Stylesheet': '样式表插件库标签',
  '$:/tags/SystemPluginLibrary/JavaScript': 'JavaScript插件库标签',
  '$:/tags/SystemPluginLibrary/Macro': '宏插件库标签',
  '$:/tags/SystemPluginLibrary/Widget': '部件插件库标签',
  '$:/tags/SystemPluginLibrary/Filter': '过滤器插件库标签',
  '$:/tags/SystemPluginLibrary/FilterOperator': '过滤器操作符插件库标签',
  '$:/tags/SystemPluginLibrary/FilterRunPrefix': '过滤器运行前缀插件库标签',
  '$:/tags/SystemPluginLibrary/FilterRunSuffix': '过滤器运行后缀插件库标签'
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
    // bold: { pattern: "''.*?''", description: '粗体文本，例如：`''bold text''`' },
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

  // 模块类型补全
  const moduleTypeMatch = lineText.match(/^module-type:\s*([^$]*)$/);
  if (moduleTypeMatch) {
    const prefix = moduleTypeMatch[1].trim();
    return MODULE_TYPES
      .filter(type => type.toLowerCase().includes(prefix.toLowerCase()))
      .map(type => ({
        label: type,
        kind: CompletionItemKind.Constant,
        insertText: type,
        detail: MODULE_TYPE_DESCRIPTIONS[type] || '模块类型',
        documentation: {
          kind: 'markdown',
          value: `**${type}**\n\n${MODULE_TYPE_DESCRIPTIONS[type] || '模块类型'}`
        }
      }));
  }

  // 类型补全
  const typeMatch = lineText.match(/^type:\s*([^$]*)$/);
  if (typeMatch) {
    const prefix = typeMatch[1].trim();
    return SYSTEM_TYPES
      .filter(type => type.toLowerCase().includes(prefix.toLowerCase()))
      .map(type => ({
        label: type,
        kind: CompletionItemKind.Constant,
        insertText: type,
        detail: TYPE_DESCRIPTIONS[type] || '系统类型',
        documentation: {
          kind: 'markdown',
          value: `**${type}**\n\n${TYPE_DESCRIPTIONS[type] || '系统类型'}`
        }
      }));
  }

  // 标签补全
  const tagsMatch = lineText.match(/^tags:\s*([^$]*)$/);
  if (tagsMatch) {
    const prefix = tagsMatch[1].trim();
    const existingTags = new Set(text.match(/^tags:\s*(.*)$/m)?.[1].split(/\s+/) || []);

    return SYSTEM_TAGS
      .filter(tag => !existingTags.has(tag) && tag.toLowerCase().includes(prefix.toLowerCase()))
      .map(tag => ({
        label: tag,
        kind: CompletionItemKind.Constant,
        insertText: tag,
        detail: TAG_DESCRIPTIONS[tag] || '系统标签',
        documentation: {
          kind: 'markdown',
          value: `**${tag}**\n\n${TAG_DESCRIPTIONS[tag] || '系统标签'}`
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
  const fieldMatch = line.match(/(\w+):/);
  if (fieldMatch) {
    const field = fieldMatch[1];
    if (FIELDS.includes(field)) {
      return {
        contents: {
          kind: 'markdown',
          value: `**${field}**\n\n${FIELD_DESCRIPTIONS[field] || 'TiddlyWiki 字段'}\n\n示例：\`${field}: 值\``
        },
        range: {
          start: { line: position.line, character: fieldMatch.index || 0 },
          end: { line: position.line, character: (fieldMatch.index || 0) + field.length }
        }
      };
    }
  }

  // 模块类型悬浮提示
  const moduleTypeLine = document.getText({
    start: { line: position.line, character: 0 },
    end: { line: position.line, character: position.character }
  });

  if (moduleTypeLine.startsWith('module-type:')) {
    const typeMatch = moduleTypeLine.match(/[a-z]+/);
    if (typeMatch) {
      const type = typeMatch[0];
      if (MODULE_TYPES.includes(type)) {
        return {
          contents: {
            kind: 'markdown',
            value: `**${type}**\n\n${MODULE_TYPE_DESCRIPTIONS[type] || '模块类型'}`
          },
          range: {
            start: { line: position.line, character: typeMatch.index || 0 },
            end: { line: position.line, character: (typeMatch.index || 0) + type.length }
          }
        };
      }
    }
  }

  // 类型悬浮提示
  const typeLine = document.getText({
    start: { line: position.line, character: 0 },
    end: { line: position.line, character: position.character }
  });

  if (typeLine.startsWith('type:')) {
    const typeMatch = typeLine.match(/[a-z]+\/[a-z0-9+-.]+/);
    if (typeMatch) {
      const type = typeMatch[0];
      if (SYSTEM_TYPES.includes(type)) {
        return {
          contents: {
            kind: 'markdown',
            value: `**${type}**\n\n${TYPE_DESCRIPTIONS[type] || '系统类型'}`
          },
          range: {
            start: { line: position.line, character: typeMatch.index || 0 },
            end: { line: position.line, character: (typeMatch.index || 0) + type.length }
          }
        };
      }
    }
  }

  // 标签悬浮提示
  const tagsLine = document.getText({
    start: { line: position.line, character: 0 },
    end: { line: position.line, character: position.character }
  });

  if (tagsLine.startsWith('tags:')) {
    const tagMatch = tagsLine.match(/\$:\/tags\/[^\s]+/);
    if (tagMatch) {
      const tag = tagMatch[0];
      if (SYSTEM_TAGS.includes(tag)) {
        return {
          contents: {
            kind: 'markdown',
            value: `**${tag}**\n\n${TAG_DESCRIPTIONS[tag] || '系统标签'}`
          },
          range: {
            start: { line: position.line, character: tagMatch.index || 0 },
            end: { line: position.line, character: (tagMatch.index || 0) + tag.length }
          }
        };
      }
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
        },
        range: {
          start: { line: position.line, character: macroMatch.index || 0 },
          end: { line: position.line, character: (macroMatch.index || 0) + macro.length + 2 }
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