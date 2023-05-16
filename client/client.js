const vscode = require('vscode');
const { LanguageClient, TransportKind } = require('vscode-languageclient');
const { applyErrorDecorationsForActiveEditor, filterErrorDiagnostics, createErrorDecorations, createErrorDecorationType } = require('./errorDecorations');
const state = require('./state');

let diagnosticsCollection = vscode.languages.createDiagnosticCollection('bass-vscode');


function getServerOptions(context) {
    const serverModule = context.asAbsolutePath('server/server.js');
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    return {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions },
    };
}

function getClientOptions() {
    return {
        documentSelector: [
            { scheme: 'file', language: 'bass' },
            { scheme: 'file', language: 'bass-snes' },
            { scheme: 'file', language: 'bass-megadrive' },
            { scheme: 'file', language: 'bass-nes' },
        ],
        synchronize: {
            configurationSection: 'bass',
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc'),
        },
    };
}

function createAndStartLanguageClient(context, serverOptions, clientOptions) {
    const languageClient = new LanguageClient('bass', 'bass-vscode', serverOptions, clientOptions);
    languageClient.start();

    languageClient.onReady().then(() => {
        languageClient.onNotification("textDocument/publishDiagnostics", ({ uri, diagnostics }) => {
            console.log(`Received diagnostics for ${vscode.window.activeTextEditor.document.uri.toString()}`);
            state.sharedDiagnostics = diagnostics;
            const editor = vscode.window.activeTextEditor;

            const filteredDiagnostics = diagnostics.filter((diagnostic) =>
                editor.document.uri.fsPath.includes(diagnostic.source)
            );

            if (editor && editor.document.uri.toString() === uri) {
                applyErrorDecorationsForActiveEditor(editor, filteredDiagnostics);
            }

            diagnosticsCollection.set(vscode.Uri.parse(uri), filteredDiagnostics);

        });
    });

    return languageClient;
}

module.exports = {
    getServerOptions,
    getClientOptions,
    createAndStartLanguageClient,
};
