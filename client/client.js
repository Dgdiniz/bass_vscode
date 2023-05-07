const vscode = require('vscode');
const { LanguageClient, TransportKind } = require('vscode-languageclient');
const { applyErrorDecorationsForActiveEditor } = require('./errorDecorations');

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
        languageClient.onNotification("textDocument/didChange", () => applyErrorDecorationsForActiveEditor(vscode.window.activeTextEditor, languageClient, errorDecorationType));
        languageClient.onNotification("textDocument/didSave", () => applyErrorDecorationsForActiveEditor(vscode.window.activeTextEditor, languageClient, errorDecorationType));
    });

    return languageClient;
}

module.exports = {
    getServerOptions,
    getClientOptions,
    createAndStartLanguageClient,
};
