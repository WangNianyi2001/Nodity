openssl genrsa -out conf/key.pem
openssl req -new -key conf/key.pem -out conf/csr.pem
openssl x509 -req -days 9999 -in conf/csr.pem -signkey conf/key.pem -out conf/cert.pem
