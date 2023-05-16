const vscode = require('vscode');

const errorDecorationType = createErrorDecorationType();

function createErrorDecorationType() {
    return vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 0, 0, 1)',
    });
}

async function applyErrorDecorationsForActiveEditor(editor, diagnostics) {
    console.log(`Applying decorations for ${editor.document.uri.toString()}`);

    const errorDiagnostics = filterErrorDiagnostics(diagnostics);
    const decorations = createErrorDecorations(errorDiagnostics);

    console.log(`Applying ${decorations.length} decorations for ${editor.document.uri.toString()}`);

    editor.setDecorations(errorDecorationType, decorations);
}

async function removeErrorDecorationsForActiveEditor(editor) {
    editor.setDecorations(errorDecorationType, []);
}

async function requestDiagnostics(uri, client) {
    console.log("Getting diagnostics...");
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
    removeErrorDecorationsForActiveEditor,
};
