# Shantea Controls website

Jekyll website using the shared OpenDeck design for the homepage, gallery, and blog.

## Setup

Launch the container from VSCode.

## Development

This will give you file watching, browser synchronisation, auto-rebuild, CSS injecting etc (run in repository root):

```shell
$ make
```

## Build for production

```shell
$ make prod
```

Production files will be located in `_site/deploy`.
## Supported-board gallery

The gallery is generated from the [OpenDeck wiki board index](https://github.com/shanteacontrols/OpenDeck/wiki/Supported-boards).
Every full `make` or `make prod` build refreshes `_data/boards.json` from GitHub.
Images load directly from the wiki on `raw.githubusercontent.com`; they are not copied into this repository.
The sync script requires Node.js 18 or newer.

To add a board, publish its wiki page with a board photo as the first Markdown image,
include `* MIDI:` and `* OSC:` in its overview, and link it from `Supported-boards`.
The next website build picks it up automatically, including its image, name, connections, and guide link.
Keep the generated JSON snapshot in version control so builds can use it if GitHub is temporarily unavailable.
A failed refresh prints a warning and leaves the previous snapshot intact; without a snapshot, the build fails.

To refresh explicitly and fail on any download error:

```shell
make boards
```

To check wiki parsing:

```shell
node --test scripts/sync-boards.test.js
```

## Design and assets

All pages use `_layouts/platform.html` and `_scss/landing/platform.scss`.
Gallery sections are shared includes, and the blog uses the same navigation, typography, and colors.
Full builds clear `_site` before generating pages and assets. Production builds write the finished site to `_site/deploy`.
