FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/nginx.conf
RUN npm run build
COPY dist /usr/share/nginx/html

ARG GIT_COMMIT_SHA
ENV GIT_COMMIT_SHA=$GIT_COMMIT_SHA

EXPOSE 80
