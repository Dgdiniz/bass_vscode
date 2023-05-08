const vscode = require('vscode');

function createWordDecorationType() {
    return vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 255, 0, 0.2)', // Semi-transparent yellow
        borderRadius: '3px', // Rounded border (optional)
        border: '1px solid rgba(255, 0, 0, 0.8)', // Border with some transparency
        borderWidth: '3px' // Border width
    });
}

function applyWordDecorationsForActiveEditor(editor, wordDecorationType) {
    const regex = /\b(REG_APUIO0|REG_APUIO1|REG_APUIO2|REG_APUIO3|REG_WMDATA|REG_WMADDL|REG_WMADDM|REG_WMADDH|REG_JOYWR|REG_JOYA|REG_JOYB)\b/g;
    const text = editor.document.getText();
    const decorations = [];

    let match;
    while (match = regex.exec(text)) {
        const startPos = editor.document.positionAt(match.index);
        const endPos = editor.document.positionAt(match.index + match[0].length);
        const decoration = { range: new vscode.Range(startPos, endPos) };
        decorations.push(decoration);
    }

    editor.setDecorations(wordDecorationType, decorations);
}

module.exports = {
    createWordDecorationType,
    applyWordDecorationsForActiveEditor,
};
