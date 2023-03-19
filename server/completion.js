const { CompletionItem, CompletionItemKind } = require("vscode-languageserver");

function provideCompletionItems(params) {
    const completionItems = [
        // Create completion items for instructions, registers, etc.
        CompletionItem.create('LDA', CompletionItemKind.Keyword),
        CompletionItem.create('STA', CompletionItemKind.Keyword),
        CompletionItem.create('REG_ACC', CompletionItemKind.Variable),
        CompletionItem.create('REG_HVJOY_STATUS_4212', CompletionItemKind.Variable),
        // Add more completion items as needed
    ];

    return completionItems;
}

module.exports = {
    provideCompletionItems
};