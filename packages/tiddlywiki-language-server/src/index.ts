import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  CompletionItem,
  CompletionItemKind,
  InitializeParams,
  TextDocumentPositionParams,
  Hover,
  TextDocumentSyncKind
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getCompletions, getHover, getDiagnostics } from 'tiddlywiki-language-service';

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams) => ({
  capabilities: {
    textDocumentSync: TextDocumentSyncKind.Full,
    completionProvider: {},
    hoverProvider: true
  }
}));

connection.onCompletion(
  (params: TextDocumentPositionParams): CompletionItem[] => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return [];
    return getCompletions(doc, params.position);
  }
);

connection.onHover(
  (params: TextDocumentPositionParams): Hover | undefined => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return undefined;
    return getHover(doc, params.position);
  }
);

documents.onDidChangeContent(change => {
  const diagnostics = getDiagnostics(change.document);
  connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
});

documents.listen(connection);
connection.listen();