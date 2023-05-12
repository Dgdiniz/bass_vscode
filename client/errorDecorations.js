const vscode = require('vscode');

function createErrorDecorationType() {
    return vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
    });
}

async function applyErrorDecorationsForActiveEditor(editor, client, errorDecorationType) {
    const diagnostics = await requestDiagnostics(editor.document.uri.toString(), client);
    const errorDiagnostics = filterErrorDiagnostics(diagnostics);
    const decorations = createErrorDecorations(errorDiagnostics);

    editor.setDecorations(errorDecorationType, decorations);
}

async function requestDiagnostics(uri, client) {
    return await client.sendRequest("getDiagnostics", { uri });
}

function filterErrorDiagnostics(diagnostics) {
    return diagnostics.filter((diagnostic) => diagnostic.severity === 1);
}

function createErrorDecorations(errorDiagnostics) {
    return errorDiagnostics.map((diagnostic) => {
        const start = diagnostic.range.start;
        const end = diagnostic.range.end;

        const startPosition = new vscode.Position(start.line, start.character);
        const endPosition = new vscode.Position(end.line, end.character);
        const errorRange = new vscode.Range(startPosition, endPosition);

        return { range: errorRange };
    });
}

module.exports = {
    createErrorDecorationType,
    applyErrorDecorationsForActiveEditor,
};
