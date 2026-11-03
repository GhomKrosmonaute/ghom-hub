# Image unique paramétrée par APP (hub | nbng | admin).
#   docker build -f infra/Dockerfile --build-arg APP=hub -t ghom-hub .
ARG APP=hub

FROM oven/bun:1.3.14 AS build
ARG APP
WORKDIR /repo
COPY . .
RUN bun install --frozen-lockfile
# Les NEXT_PUBLIC_* sont figés au build : on les passe en build-args.
ARG NEXT_PUBLIC_ROOT_DOMAIN=ghom.fr
ARG NEXT_PUBLIC_STUDIO_LABEL=nobrainnogame
ARG NEXT_PUBLIC_PROTOCOL=https
ARG NEXT_PUBLIC_HUB_URL=https://ghom.fr
ARG NEXT_PUBLIC_STUDIO_URL=https://nobrainnogame.ghom.fr
ENV NEXT_PUBLIC_ROOT_DOMAIN=$NEXT_PUBLIC_ROOT_DOMAIN \
    NEXT_PUBLIC_STUDIO_LABEL=$NEXT_PUBLIC_STUDIO_LABEL \
    NEXT_PUBLIC_PROTOCOL=$NEXT_PUBLIC_PROTOCOL \
    NEXT_PUBLIC_HUB_URL=$NEXT_PUBLIC_HUB_URL \
    NEXT_PUBLIC_STUDIO_URL=$NEXT_PUBLIC_STUDIO_URL \
    NEXT_TELEMETRY_DISABLED=1
# Pas de DATABASE_URL au build : la page est générée avec les données de repli,
# puis régénérée (ISR, 60 s) depuis la vraie base une fois en production.
RUN touch .env && bunx turbo run build --filter=@ghom/${APP}

FROM node:24-slim AS run
ARG APP
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1 APP_DIR=apps/${APP}
WORKDIR /app
COPY --from=build --chown=node:node /repo/apps/${APP}/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=build --chown=node:node /repo/apps/${APP}/public ./apps/${APP}/public
USER node
EXPOSE 3000
CMD ["sh", "-c", "node $APP_DIR/server.js"]
