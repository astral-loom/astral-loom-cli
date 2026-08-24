# Astral Loom CLI - Usage Walkthrough

This guide provides a quick walkthrough of the core commands in the `astral-loom-cli` based on real interactions with the Stellar Testnet.

## 1. Create a Testnet Account

Creating a testnet account will automatically generate a new keypair and fund it via Friendbot.

```bash
$ loom account create

Generating new keypair...
Public Key: GDQJGCOVVSEIB2OCSL3J4TCMZKQM2YMO24XVDJFGJ22IGZSCBWYAGHGD
Secret Key: SCJ73CJKNB6XQH3Y4IO3S6JKDT4HE7XOKKAMGDHWUSAQYFBXPTDG4PNW

Funding account on Testnet via Friendbot...
SUCCESS! Account funded successfully.
```

## 2. Check Account Balance

You can query the balance and trustlines of any account (even if you didn't create it).

```bash
$ loom balance GDQJGCOVVSEIB2OCSL3J4TCMZKQM2YMO24XVDJFGJ22IGZSCBWYAGHGD --network testnet

Querying testnet for account: GDQJGCOVVSEIB2OCSL3J4TCMZKQM2YMO24XVDJFGJ22IGZSCBWYAGHGD

┌────────────┬─────────────┬───────────┐
│ Asset Code │ Balance     │ Limit     │
├────────────┼─────────────┼───────────┤
│ XLM        │ 10000.00000 │ Unlimited │
└────────────┴─────────────┴───────────┘
```

## 3. Decode an XDR String

Stellar uses XDR to serialize transactions. You can inspect an XDR payload directly from the CLI.

```bash
$ loom xdr decode AAAAAgAAAAAXaoS9R3sVHwDyYo/d/eZ2lvpX+uENiKOWD/q6eRRNAwAAAAAAAAAAAAAAAgAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==

{
  "_maxDepth": 200,
  "_switch": {
    "name": "envelopeTypeTx",
    "value": 2
  },
  "_arm": "v1",
  "_value": {
    "_maxDepth": 200,
    "_attributes": {
      "tx": {
        "_maxDepth": 200,
        "_attributes": {
          "sourceAccount": {
            "_maxDepth": 200,
            "_switch": {
              "name": "keyTypeEd25519",
              "value": 0
            },
            "_arm": "ed25519",
            "_armType": {
              "_length": 32
            },
            "_value": {
              "type": "Buffer",
              "data": [
                23, 106, 132, 189, 71, 123, 21, 31, 0, 242, 98,
                143, 221, 253, 230, 118, 150, 250, 87, 250, 225,
                13, 136, 163, 150, 15, 250, 186, 121, 20, 77, 3
              ]
            }
          },
          "fee": 0,
          "seqNum": {
            "_value": "2"
          },
          "cond": {
            "_maxDepth": 200,
            "_switch": {
              "name": "precondTime",
              "value": 1
            },
            "_arm": "timeBounds",
            "_value": {
              "_maxDepth": 200,
              "_attributes": {
                "minTime": {
                  "_value": "0"
                },
                "maxTime": {
                  "_value": "0"
                }
              }
            }
          },
          "memo": {
            "_maxDepth": 200,
            "_switch": {
              "name": "memoNone",
              "value": 0
            }
          },
          "operations": [],
          "ext": {
            "_maxDepth": 200,
            "_switch": 0
          }
        }
      },
      "signatures": []
    }
  }
}
```
