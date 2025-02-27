cd mxhentai-front
# Install dependencies
pnpm install
# Build
pnpm build
# cp build result to outside
cp -r dist ../
cd ..

# compress
mkdir compress
tar -czvf compress/dist.tar.gz dist/*
zip -r compress/dist.zip dist/*
