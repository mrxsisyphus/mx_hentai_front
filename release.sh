cd mxhentai-front
# Install dependencies
pnpm install
# Build
pnpm build
# cp build result to outside
cp -r build ../
cd ..

# compress
mkdir compress
tar -czvf compress/dist.tar.gz build/*
zip -r compress/dist.zip build/*
