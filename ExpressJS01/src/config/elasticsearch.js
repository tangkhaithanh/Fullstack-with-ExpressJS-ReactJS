const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    username: 'elastic',
    password: '123456'
  },
  tls: {
    rejectUnauthorized: false // để bỏ qua self-signed cert khi dev
  }
});

module.exports = client;
