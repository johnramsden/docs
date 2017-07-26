#!/bin/sh

# Gulp:
npm update && npm install

# See: https://github.com/manveru/bundix
#      http://nixos.org/nixpkgs/manual/#sec-language-ruby

nix-shell -p bundler --command "bundler package --path /tmp/vendor/bundle"
$(nix-build '<nixpkgs>' -A bundix)/bin/bundix
nix-shell
