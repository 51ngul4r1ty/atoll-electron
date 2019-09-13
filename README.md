Overview
========

See `atoll` repo for an overview of the full project.  This repo is for the desktop client that
uses electron to allow the atoll-shared library to be used for the desktop app as well as the
web app.

Getting Started
===============

Use this document to get a quick start with the electron desktop client code.  In future
we'll have more detailed information in separate documents in the "docs" folder.

Tools Used
----------

1. See `atoll` repo for Node & NPM versions to use.
2. See `atoll` repo for current version of VS Code that's recommended.
  - Make sure you install the recommended workspace extensions.

Steps after Cloning Repo
------------------------

1. `npm ci` to install a locked down dependency tree.
2. Clone `atoll-shared` repo and follow instructions in its README.md to get it building correctly.
3. `npm link` in `atoll-shared` root folder, `npm link @atoll/shared` in this repo's root folder.
4. `npm start` to build and launch the electron hosted app.
5