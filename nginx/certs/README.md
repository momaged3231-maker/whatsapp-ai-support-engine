# SSL certificates

Place your TLS certificate files here (referenced by `nginx/nginx.conf`):

- `fullchain.pem`
- `privkey.pem`

## Option A — Let's Encrypt (production)

```bash
# example with certbot on the host, then copy into ./nginx/certs
sudo certbot certonly --webroot -w ./nginx/certs -d your-domain.com
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./nginx/certs/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem   ./nginx/certs/
docker compose restart nginx
```

## Option B — Self-signed (local testing only)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem -out fullchain.pem \
  -subj "/CN=localhost"
```

> WhatsApp Cloud API requires a **publicly reachable HTTPS** webhook with a
> valid certificate. Self-signed certs will not work for the live webhook.
