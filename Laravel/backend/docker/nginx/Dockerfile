FROM nginx:1.27-alpine

# Remove config padrao
RUN rm /etc/nginx/conf.d/default.conf

# Copia config customizado
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/security.conf /etc/nginx/snippets/security.conf

# Ajusta permissoes
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

USER nginx
