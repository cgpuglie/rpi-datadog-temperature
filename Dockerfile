FROM raspbian/jessie

WORKDIR /usr/src/pi-dd-temp
# Install dependencies
COPY ./package.json .
RUN apt-get update && \
  apt-get install -y curl python-software-properties && \
  curl -sL https://deb.nodesource.com/setup_9.x | bash - && \
  apt-get install -y nodejs && \
  npm i

COPY . .

CMD ["node", "index.js"]
