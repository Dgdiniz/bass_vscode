const {
    TextDocuments,
    createConnection
} = require("vscode-languageserver");

const { TextDocument } = require("vscode-languageserver-textdocument");
const { provideCompletionItems } = require("./completion");

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
            diagnostics: results
        });
    });

const connection = createConnection();
const documents = new TextDocuments(TextDocument);

connection.onInitialize(() => ({
    capabilities: {
        textDocumentSync: documents.syncKind,
        completionProvider: {
            resolveProvider: false,
            triggerCharacters: [],
        },
    },
}));

connection.onRequest("getDiagnostics", (params) => {
    return new Promise((resolve) => {
        getBassDiagnostics((results) => {
            const diagnostics = results.filter((diagnostic) =>
                params.uri.includes(diagnostic["source"])
            );

            resolve(diagnostics);
        });
    });
});

connection.onCompletion(provideCompletionItems);

documents.onDidChangeContent((change) => {
    getDiagnostics(change);
});

documents.onDidSave((change) => {
    getDiagnostics(change);
});

documents.listen(connection);

connection.listen();