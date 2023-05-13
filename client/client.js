const vscode = require('vscode');
const { LanguageClient, TransportKind } = require('vscode-languageclient');
const { applyErrorDecorationsForActiveEditor, filterErrorDiagnostics, createErrorDecorations, createErrorDecorationType } = require('./errorDecorations');

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
        const errorDecorationType = createErrorDecorationType();

        languageClient.onNotification("textDocument/publishDiagnostics", ({ uri, diagnostics }) => {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.uri.toString() === uri) {
                applyErrorDecorationsForActiveEditor(editor, diagnostics, errorDecorationType);
            }
        });
    });

    return languageClient;
}

module.exports = {
    getServerOptions,
    getClientOptions,
    createAndStartLanguageClient,
};
