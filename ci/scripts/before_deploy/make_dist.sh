# The directory to move necessary files into
target="$1"

if [ -z "$target" ]; then
  >&2 echo "Error: no target directory provided"
  exit 1
fi

mkdir -p "$target"

cp -r assets "$target"
cp favicon.ico "$target"

if [ "$MINIFY" = true ]; then
  npm run minify
  cp dist/index.html "$target"
else
  cp -r dist "$target"
  cp -r stylesheets "$target"
  cp index.html "$target"
fi

