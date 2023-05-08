const vscode = require('vscode');
const { applyErrorDecorationsForActiveEditor } = require('./errorDecorations');
const { createWordDecorationType, applyWordDecorationsForActiveEditor } = require('./keywordDecorations');

function registerEventListeners(context, client, errorDecorationType) {
    const wordDecorationType = createWordDecorationType();

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document) {
                applyErrorDecorationsForActiveEditor(editor, client, errorDecorationType);
                applyWordDecorationsForActiveEditor(editor, wordDecorationType);
            }
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                applyErrorDecorationsForActiveEditor(editor, client, errorDecorationType);
                applyWordDecorationsForActiveEditor(editor, wordDecorationType);
            }
        })
    );
}

module.exports = {
    registerEventListeners,
};
