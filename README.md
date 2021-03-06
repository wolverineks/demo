[![Netlify Status](https://api.netlify.com/api/v1/badges/27e2676c-59a7-401e-85dd-aed19b33dacc/deploy-status)](https://app.netlify.com/sites/suspicious-yalow-4f0e30/deploys)

# Edge React Hooks - Demo

## Getting Started

### Required Environment

- node 10.22.0
- yarn
- serve

### Setup

```bash
git clone git@github.com:wolverineks/demo.git
```

```bash
cd demo
```

```bash
nvm use 10.22.0
```

```bash
// development
yarn && yarn start

// prod
yarn && yarn build && yarn serve
```

## Feature Set

### Auth

- [x] create account
- [ ] check password rules
- [ ] login
  - [x] password
  - [x] pin
  - [ ] key
  - [ ] recovery
- [ ] get recovery key
- [ ] fetch recovery questions
- [ ] list recovery question choices
- [ ] request edge login
- [ ] request otp reset
- [ ] pending vouchers
- [ ] approve voucher
- [ ] reject voucher

### Wallets

- [x] create wallet
- [x] activate wallet
- [x] archive wallet
- [x] delete wallet
- [x] create default wallets
- [x] sort wallets
- [ ] drag to sort wallets

### Account Settings

- [x] enable / disable pin login
- [x] change pin
- [x] check pin
- [x] delete pin
- [x] change password
- [x] check password
- [x] delete password
- [x] change default fiat currency code
- [x] enable / disable otp
- [x] autologout
- [x] set display denominations
- [x] dataStore explorer
- [x] disklet explorer
- [x] local disklet explorer

### Wallet Settings

- [x] rename wallet
- [x] set fiat currency code
- [x] display public seed
- [x] display private seed
- [x] display raw key
- [x] disklet explorer
- [x] local disklet explorer
- [ ] split wallet
- [ ] add / enable / disable custom nodes

### Tokens

- [x] enable / disable tokens
- [x] add custom token
- [x] edit custom token

### Send

- [x] input via crypto / fiat
- [x] input via scan
  - [x] amount
  - [x] publicAddress
  - [x] uniqueIdentifier
  - [x] name
  - [x] notes
  - [x] category
- [x] multiple targets
- [x] destination tag
- [x] change fee setting
- [x] change fee setting
- [x] categories
- [ ] custom categories
- [x] metadata
- [ ] JSON payment protocol

### Receive

- [x] input via crypto / fiat
- [x] copy public address
- [x] copy uri
- [x] display qr code

### Transactions

- [x] view / filter transactions
- [x] export transactions
- [x] view transaction explorers
- [ ] edit metadata

### Exchange Rates

- [x] filter
- [ ] add currency code

### FIO

- [ ] wallet.otherMethods
  - [ ] fioAction
  - [ ] getFioAddressNames
  - [ ] getFioAddresses
  - [ ] getFioDomains
- [ ] plugin.otherMethods
  - [ ] getActivationSupportedCurrencies
  - [ ] buyAddressRequest
  - [ ] isFioAddressValid
  - [ ] getDomains
  - [ ] validateAccount

### Internationalization / Localization

- [ ] translations
- [ ] commas, decimal points

### Theme

- [x] light theme
- [ ] dark theme

### Other

- [ ] biggy string
