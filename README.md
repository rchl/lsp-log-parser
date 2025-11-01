# lsp-log-parser
[![Netlify Status](https://api.netlify.com/api/v1/badges/09cdde69-9cde-414a-b622-1a9abb712400/deploy-status)](https://app.netlify.com/sites/lsp-log-parser/deploys)

Parser for LSP server logs from Sublime Text, VSCode and coc.nvim.

Also supports connecting to currently running Sublime LSP instance and displaying live view of all the server <-> client communication. To be able to connect to the LSP instance, set the following LSP setting:

```json
    "log_server": [
        "panel",
        "remote"
    ],
```

Deployed automatically on commit to https://lsp-log-parser.netlify.app/

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
