# lsp-log-parser
[![Netlify Status](https://api.netlify.com/api/v1/badges/09cdde69-9cde-414a-b622-1a9abb712400/deploy-status)](https://app.netlify.com/sites/lsp-log-parser/deploys)

Parser for LSP server logs from Sublime Text, VSCode and coc.nvim.

Also supports connecting to currently running Sublime LSP instance and displaying live view of all the server <-> client communication. To connect to the LSP instance, run `LSP: Open Remote Log Viewer` from the Command Palette or choose `Open Remote Log Viewer` from the context menu of the LSP Log Panel in Sublime Text. That starts a local websocket server and opens this page with the server port and a random token in the URL fragment. The server only accepts connections that pass that token.

With older LSP versions, which don't have that command, set the following LSP setting, restart Sublime Text and press the Remote button. The viewer then connects to the server on port 9981 without a token.

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
$ pnpm install

# serve with hot reload at localhost:3000
$ pnpm dev

# build for production and launch server
$ pnpm build
$ pnpm start

# generate static project
$ pnpm generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
