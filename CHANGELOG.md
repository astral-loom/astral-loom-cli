# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-31

### Added
- Initial release
- Terminal interface exposed via the `loom` command
- `account create` command to seamlessly create and fund new Stellar testnet accounts
- `xdr decode` command to decode and pretty-print base64 transaction XDR envelopes
- Built-in `BigInt` serialization support for XDR outputs
- `generate_xdr.mjs` script for generating random testnet transaction XDR (useful for testing)
