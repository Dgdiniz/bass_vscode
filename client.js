const vscode = require('vscode');
const { LanguageClient, TransportKind } = require('vscode-languageclient');

let client;

function activate(context) {
  const serverOptions = getServerOptions(context);
  const clientOptions = getClientOptions();

  client = createAndStartLanguageClient(serverOptions, clientOptions);

  registerEventListeners(context);
}

function deactivate() {
  return client ? client.stop() : undefined;
}

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

function createAndStartLanguageClient(serverOptions, clientOptions) {
  const languageClient = new LanguageClient('bass', 'bass-vscode', serverOptions, clientOptions);
  languageClient.start();

  languageClient.onReady().then(() => {
    languageClient.onNotification("textDocument/didChange", applyErrorDecorationsForActiveEditor);
    languageClient.onNotification("textDocument/didSave", applyErrorDecorationsForActiveEditor);
  });

  return languageClient;
}

function registerEventListeners(context) {
  const errorDecorationType = createErrorDecorationType();

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(({ document }) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && document === editor.document) {
        applyErrorDecorations(editor, errorDecorationType);
      }
    }),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        applyErrorDecorations(editor, errorDecorationType);
      }
    })
  );
}

function createErrorDecorationType() {
  return vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  });
}

async function applyErrorDecorationsForActiveEditor() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    applyErrorDecorations(editor, createErrorDecorationType());
  }
}

async function applyErrorDecorations(editor, errorDecorationType) {
  const diagnostics = await requestDiagnostics(editor.document.uri.toString());
  const errorDiagnostics = filterErrorDiagnostics(diagnostics);
  const decorations = createErrorDecorations(errorDiagnostics);

  editor.setDecorations(errorDecorationType, decorations);
}

async function requestDiagnostics(uri) {
  return await client.sendRequest("getDiagnostics", { uri });
}

function filterErrorDiagnostics(diagnostics) {
  return diagnostics.filter(({ severity }) => severity === 1);
}

function createErrorDecorations(errorDiagnostics) {
  return errorDiagnostics.map(({ range: { start, end } }) => {
    const startPosition = new vscode.Position(start.line, start.character);
    const endPosition = new vscode.Position(end.line, end.character);
    const errorRange = new vscode.Range(startPosition, endPosition);

    return { range: errorRange };
  });
}

module.exports = {
  activate,
  deactivate,
};
