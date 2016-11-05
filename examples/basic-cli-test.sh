#!/bin/bash

script_directory(){
  local source="${BASH_SOURCE[0]}"
  local dir=""

  while [ -h "$source" ]; do # resolve $source until the file is no longer a symlink
    dir="$( cd -P "$( dirname "$source" )" && pwd )"
    source="$(readlink "$source")"
    [[ $source != /* ]] && source="$dir/$source" # if $source was a relative symlink, we need to resolve it relative to the path where the symlink file was located
  done

  dir="$( cd -P "$( dirname "$source" )" && pwd )"

  echo "$dir"
}

main() {
  local script_dir="$(script_directory)"
  local project_dir="$script_dir/.."
  local assets_dir="$script_dir/assets"
  local template_dir="$script_dir/templates/basic"
  local tmp_dir="$project_dir/tmp"
  local output_file="$tmp_dir/basic-$RANDOM.pdf"
  mkdir -p "$tmp_dir"

  $project_dir/command.js \
    --template-path $template_dir \
    --include $assets_dir/basic.css,$assets_dir/custom-margin.css \
    --margin-type 2 \
    $assets_dir/basic.html -o $output_file || exit 1

  open $output_file
}

main "$@"
