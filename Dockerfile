# --------------
# BUILD STAGE
# --------------
FROM node:lts as build
WORKDIR /app

# get dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# compile typescript
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

# get production dependencies
RUN yarn install --frozen-lockfile --production

# --------------
# RUN STAGE
# --------------
FROM alpine

# get node interpreter
RUN apk add nodejs --no-cache

RUN addgroup -S app && adduser -S -G app app
USER app
WORKDIR /app

# copy compiled app files
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/

ENV NODE_ENV=production

HEALTHCHECK --interval=1m --timeout=5s \
    CMD wget http://localhost:3000/health -q -O - | grep -c '{"status":"ok"}' || exit 1

CMD ["node", "index.js"]
EXPOSE 3000/tcp
