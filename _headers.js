/*
  Content-Security-Policy: default-src 'self'; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline' https:; script-src 'self' https:; connect-src 'self' https:; frame-ancestors 'self';

/admin/*
  Content-Security-Policy: default-src 'self'; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net; connect-src 'self' https://api.github.com https://github.com https://www.ferasouderfils.be; frame-ancestors 'self';