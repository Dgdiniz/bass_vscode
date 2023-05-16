const vscode = require('vscode');
const { LanguageClient, TransportKind } = require('vscode-languageclient');
const { applyErrorDecorationsForActiveEditor } = require('./errorDecorations');
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

    const path = require('path');

    languageClient.onReady().then(() => {
        languageClient.onNotification("textDocument/publishDiagnostics", ({ uri, diagnostics }) => {
            state.sharedDiagnostics = diagnostics;
            const editor = vscode.window.activeTextEditor;

            // Get the workspace root.
            const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;

            // Map to store diagnostics for each source file.
            const fileDiagnosticsMap = new Map();

            // Iterate over diagnostics, sorting them into the map by source file.
            diagnostics.forEach(diagnostic => {
                // Add the workspace root to the source field of each diagnostic.
                diagnostic.source = path.join(workspaceRoot, diagnostic.source);

                if (fileDiagnosticsMap.has(diagnostic.source)) {
                    fileDiagnosticsMap.get(diagnostic.source).push(diagnostic);
                } else {
                    fileDiagnosticsMap.set(diagnostic.source, [diagnostic]);
                }
            });

            // Clear the previous diagnostics collection.
            diagnosticsCollection.clear();

            // Apply decorations and update diagnostics collection for each source file.
            fileDiagnosticsMap.forEach((fileDiagnostics, sourceFile) => {
                if (editor && editor.document.uri.fsPath.includes(sourceFile)) {
                    applyErrorDecorationsForActiveEditor(editor, fileDiagnostics);
                }

                // Update the diagnosticsCollection for this file only.
                diagnosticsCollection.set(vscode.Uri.file(sourceFile), fileDiagnostics);
            });

            // If there are no diagnostics for the current file, clear the error decorations.
            if (editor && !fileDiagnosticsMap.has(editor.document.uri.fsPath)) {
                applyErrorDecorationsForActiveEditor(editor, []);
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
