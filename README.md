<div align="center">
  <h1>⚡ Astral Loom CLI</h1>
  <p><strong>A command-line tool for common Stellar development tasks.</strong></p>
  
  [![Build Status](https://github.com/astral-loom/astral-loom-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/astral-loom/astral-loom-cli/actions/workflows/ci.yml)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  
  🌐 Website: https://astral-loom-site.vercel.app
</div>

## Demo

![astral-loom-cli demo](./demo.gif)

---

## 📖 Overview

`astral-loom-cli` is a command-line interface for Stellar dApp developers to quickly perform common tasks like creating testnet accounts and decoding XDR envelopes without leaving the terminal.

### 🏗️ Capabilities

1. **`account create`**: Create and fund testnet accounts easily.
2. **`xdr decode`**: Decode and pretty-print transaction XDR envelopes (with built-in `BigInt` serialization support).

### 🌍 Ecosystem Architecture

`astral-loom-cli` is the terminal interface for the Astral Loom ecosystem, powered by `astral-loom-kit` under the hood.

```mermaid
flowchart TD
    %% Base Layer
    Stellar[Stellar Network]
    Horizon[Horizon API]
    Soroban[Soroban RPC]
    
    Stellar --- Horizon
    Stellar --- Soroban
    
    %% Official SDK
    SDK(("@stellar/stellar-sdk"))
    Horizon --> SDK
    Soroban --> SDK

    %% Astral Loom Layer
    subgraph Astral Loom Ecosystem
        Kit[astral-loom-kit<br/>Core TypeScript SDK]
        CLI[astral-loom-cli<br/>CLI Tooling]
        Widgets[astral-loom-widgets<br/>React UI Components]
    end

    SDK --> Kit
    
    %% Dependencies within the ecosystem
    Kit --> CLI
    Kit --> Widgets

    %% Wallets
    Wallets[Wallet Extensions<br/>Freighter, Albedo, xBull]
    Wallets -.->|WalletAdapter| Kit

    %% End Users
    Backend[Backend / dApp Devs] --> Kit
    Ops[DevOps / Power Users] --> CLI
    Frontend[Frontend / React Devs] --> Widgets
    
    classDef official fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000
    classDef loom fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    classDef users fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
    
    class SDK official
    class Kit,CLI,Widgets loom
    class Backend,Ops,Frontend users
```

---

## 🚀 Quick Start

### 1. Installation

Clone the repo and build locally:

```bash
git clone https://github.com/astral-loom/astral-loom-cli.git
cd astral-loom-cli
npm install
npm run build
npm link
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

## 💡 Examples

Check out the [examples/usage-walkthrough.md](examples/usage-walkthrough.md) for a complete terminal walkthrough showing real outputs of the CLI in action against the Stellar testnet.

---

## 🤝 Community & Maintainers

We are committed to fostering a welcoming environment. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating. If you discover a vulnerability, please review our [Security Policy](SECURITY.md) for reporting instructions.

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
