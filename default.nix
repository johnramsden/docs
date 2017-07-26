with (import <nixpkgs> {});
let
  env = bundlerEnv {
    name = "nix-jekyll";
    inherit ruby;
    gemfile = ./Gemfile;
    lockfile = ./Gemfile.lock;
    gemset = ./gemset.nix;
  };
in stdenv.mkDerivation {
  name = "nix-jekyll";
  buildInputs = [env ruby];
}
