const vscode = require('vscode');
const _ = require('lodash');
const { createWordDecorationType, applyWordDecorationsForActiveEditor } = require('./keywordDecorations');
const { applyErrorDecorationsForActiveEditor } = require('./errorDecorations');
const state = require('./state');

function registerEventListeners(context, client) {
    const wordDecorationType = createWordDecorationType();

    // Avoid saving the document too often when typing
    const debouncedSave = _.debounce((document) => document.save(), 180);

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            const editor = vscode.window.activeTextEditor;

            if (editor && event.document === editor.document) {
                if (wasLinesInsertedOrRemoved(event)) {
                    //debouncedSave(event.document);
                }

                applyWordDecorationsForActiveEditor(editor, wordDecorationType);
            }
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                const filteredDiagnostics = state.sharedDiagnostics.filter((diagnostic) =>
                    editor.document.uri.fsPath.includes(diagnostic.source)
                );

                debouncedSave(editor.document);
                applyErrorDecorationsForActiveEditor(editor, filteredDiagnostics);
                applyWordDecorationsForActiveEditor(editor, wordDecorationType);
            }
        })
    );
}

function wasLinesInsertedOrRemoved(event) {
    let linesInsertedOrRemoved = false;

    for (const change of event.contentChanges) {
        const linesBefore = change.range.end.line - change.range.start.line + 1;
        const linesAfter = change.text.split('\n').length;

        if (linesBefore !== linesAfter) {
            linesInsertedOrRemoved = true;
            break;
        }
    }

    return linesInsertedOrRemoved;
}

module.exports = {
    registerEventListeners,
};


