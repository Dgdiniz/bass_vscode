const {
    DiagnosticSeverity,
    TextDocuments,
    createConnection,
    CompletionItem,
    CompletionItemKind
} = require("vscode-languageserver");

const { TextDocument } = require("vscode-languageserver-protocol");

var exec = require("child_process").exec;

const getBassDiagnostics = (callback) => {
    exec(
        "bass -lsp -o tempbasslsp.bin main.asm",
        function (error, stdout, stderr) {
            const results = JSON.parse(stderr);
            callback(results["Diagnostics"]);
        }
    );
};

const getDiagnostics = (change) =>
    getBassDiagnostics(function (results) {
        connection.sendDiagnostics({
            uri: change.document.uri,
            diagnostics: results.filter((diagnostic) =>
                change.document.uri.includes(diagnostic["source"])
            ),
        });
    });

const connection = createConnection();
const documents = new TextDocuments(TextDocument);

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

connection.onInitialize(() => ({
    capabilities: {
        textDocumentSync: documents.syncKind,
        completionProvider: {
            resolveProvider: false,
            triggerCharacters: [], // Specify any trigger characters for the completion provider
        },
    },
}));

connection.onCompletion(provideCompletionItems);

documents.onDidChangeContent((change) => {
    getDiagnostics(change);
});

documents.onDidSave((change) => {
    getDiagnostics(change);
});

documents.listen(connection);
connection.listen();