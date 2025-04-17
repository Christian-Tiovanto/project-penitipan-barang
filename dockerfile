FROM node:20.9-alpine AS build-stage
WORKDIR /app
COPY ./package.json ./
RUN npm install && npm cache clean -f
COPY . .
RUN npm run build

FROM node:20.9-alpine AS production-stage
WORKDIR /app
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/src ./src
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/package* ./
COPY --from=build-stage /app/tsconfig* ./
ENTRYPOINT ["npm", "run", "start:prod"]