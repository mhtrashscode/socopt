#!/usr/bin/with-contenv bashio
# this script is executed in context of /app

# print a timestamp to improve log readability
now=$(date)
echo "new container start at $now"
# startup the web server
npm run start

# keep container alive
#sleep infinity