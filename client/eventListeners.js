const vscode = require('vscode');
const { applyErrorDecorationsForActiveEditor } = require('./errorDecorations');

function registerEventListeners(context, client, errorDecorationType) {
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document) {
                applyErrorDecorationsForActiveEditor(editor, client, errorDecorationType);
            }
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                applyErrorDecorationsForActiveEditor(editor, client, errorDecorationType);
            }
        })
    );
}

module.exports = {
    registerEventListeners,
};
