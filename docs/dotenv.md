The docker-compose yml(s) needs a .env file in the root directory to run properly.

Your .env file should look something like this:

```SHELL
MONGO_DATA_DIR=/data/db
MONGO_LOG_DIR=/dev/null
MONGO_INITDB_ROOT_USERNAME=mongouser
MONGO_INITDB_ROOT_PASSWORD=mongopassword
MONGO_INITDB_DATABASE=dbname
MONGO_PORT=27017
EXPRESS_PORT=80
SENDGRID_API=API_KEY
NODE_ENV=production or development
VIRTUAL_HOST=yoursite.com,www.yoursite.com
LETSENCRYPT_HOST=yoursite.com,www.yoursite.com
LETSENCRYPT_EMAIL=youremail@gmail.com
ADMIN_PASSWORD=adminpassword
PATH_TO_DRIVE=/opt/images
```