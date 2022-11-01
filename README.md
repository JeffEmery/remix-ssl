# Remix with SSL Enabled Express Server

This project is a modification of `npx create-remix@latest` using "Express
Server"

### Packages added for the Express server

- [dotenv](https://github.com/motdotla/dotenv#readme) to read in the `.env` file
  variables

### Configuration

To setup the server to run on SSL modify the `.env` file

```
HOST=hostname
PORT=3000
HTTPS=true
SSL_CRT_FILE=./ssl/dev-certificate.pem
SSL_KEY_FILE=./ssl/dev-key.pem
```

Create the subject alternative name certicate and key files with OpenSSL and
make sure they're installed in the machine certificate store.

Make sure the hostname resolves to the 127.0.0.1 (hosts).
