# bass-vscode 

This is a Vscode extension for the Bass assembler for programming retro systems. Bass is a cross assembler that supports multiple systems, and this extension aims to provide a better experience for programming in Bass. 

It aims to provide the following features:

- Syntax highlighting
- Code completion
- Diagnostics (errors and warnings)
- Decorations for special keywords, like system registers, special addresses, etc
- Support the systems that Bass supports (SNES, Sega Genesis, Nes, etc)

For now only the decorations for the SNES system are implemented. The decorations for the other systems will be implemented in the future.

## Requirements

You need to have the Bass assembler installed in your system. You can download it [here](https://github.com/Dgdiniz/bass/releases). At least version ***18.1.2*** is required. This is a custom version of Bass that I made to support the LSP protocol. The original Bass doesn't support the LSP protocol, so it can't be used with this extension.

## Installation

You can install this extension from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=bass-vscode).

## Usage

Your project can have multiple files, but it must have a file named `main.asm` in the root folder. This file will be the entry point of your project. The other files can be included in the `main.asm` file using the `include` directive.

Each system have it's own extension, and the extension determines the syntax highlighting and the decorations based on the system. Below is a list of the supported systems and their extensions:

- SNES: `.snes.asm`
- Sega Genesis: `.genesis.asm`, `.segagenesis.asm`, `.megadrive.asm`, `.md.asm`
- NES: `.nes.asm`, `.famicom.asm`, `.fc.asm`

As the main file must be named `main.asm`, it's recommended that you install the [Modelines](https://marketplace.visualstudio.com/items?itemName=chrislajoie.vscode-modelines) extension to set the file type using the Vim format. For example, if you are using the SNES system, you can add the following line to the top of your `main.asm` file:

```
//vim:ft=bass-snes
```

The filetypes for the other systems are:

- SNES: `bass-snes`
- Sega Genesis: `bass-megadrive`
- NES: `bass-nes`
