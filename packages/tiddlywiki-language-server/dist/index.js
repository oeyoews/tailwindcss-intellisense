"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const tiddlywiki_language_service_1 = require("tiddlywiki-language-service");
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
connection.onInitialize((_params) => ({
    capabilities: {
        textDocumentSync: documents.syncKind,
        completionProvider: {},
        hoverProvider: true
    }
}));
connection.onCompletion((params) => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc)
        return [];
    return (0, tiddlywiki_language_service_1.getCompletions)(doc, params.position);
});
connection.onHover((params) => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc)
        return undefined;
    return (0, tiddlywiki_language_service_1.getHover)(doc, params.position);
});
documents.onDidChangeContent(change => {
    const diagnostics = (0, tiddlywiki_language_service_1.getDiagnostics)(change.document);
    connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
});
documents.listen(connection);
connection.listen();
