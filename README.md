<div align="center">
  <h1>⚡ Astral Loom CLI</h1>
  <p><strong>A command-line tool for common Stellar development tasks.</strong></p>
  
  [![Build Status](https://github.com/astral-loom/astral-loom-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/astral-loom/astral-loom-cli/actions/workflows/ci.yml)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
</div>

---

## 📖 Overview

`astral-loom-cli` is a command-line interface for Stellar dApp developers to quickly perform common tasks like creating testnet accounts and decoding XDR envelopes without leaving the terminal.

### 🏗️ Capabilities

1. **`account create`**: Create and fund testnet accounts easily.
2. **`xdr decode`**: Decode and pretty-print transaction XDR envelopes (with built-in `BigInt` serialization support).

---

## 🚀 Quick Start

### 1. Installation

Install globally using npm:

```bash
npm install -g astral-loom-cli
```

### 2. Usage

Use the `loom` command to access utilities:

```bash
# Create and fund a testnet account
loom account create

# Decode a base64 XDR string
loom xdr decode <xdrString>
```

---

## 🤝 Community & Maintainers

Join the discussion and get support:
* **Community Link**: [Stellar Developer Discord](https://discord.gg/5aprtMSyR)

| Maintainer | Role |
|------------|------|
| Temmy2026 | Core Developer |

---

## 🛠️ Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

### 🧑‍💻 Contributors

[![Contributors](https://contrib.rocks/image?repo=astral-loom/astral-loom-cli)](https://github.com/astral-loom/astral-loom-cli/graphs/contributors)
