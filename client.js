const vscode = require('vscode');
const { LanguageClient, TransportKind } = require('vscode-languageclient');

let client;

function activate(context) {
    // The server is implemented in the 'server' folder.
    const serverModule = context.asAbsolutePath('server/server.js'); // Replace 'yourServerFile.js' with your server file name
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    // If the extension is launched in debug mode, then the debug server options are used.
    // Otherwise, the run options are used.
    const serverOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions },
    };

    // Options to control the language client
    const clientOptions = {
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

    // Create the language client and start the client.
    client = new LanguageClient('bass', 'bass-highlight', serverOptions, clientOptions);
    client.start();
}

function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

module.exports = {
    activate,
    deactivate,
};
