# Validity-REST

RESTful API for [Validity](https://movva-gpu/Validity) discord bot.

To install dependencies:

```bash
bun install
```

To run locally:

```bash
bun dev
```

To build with docker on your server:
```bash
docker build -t validity-rest .
```

Then to run the image:
```bash
docker run -d -p 82:8080 validity-rest
```

This project was created using `bun init` in bun v1.0.32. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
