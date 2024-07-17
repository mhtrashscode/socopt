# Let HA choose the container base image dynamically
ARG BUILD_FROM
FROM $BUILD_FROM

# Copy content of the rootfs folder to the containers file system (root path /) 
COPY rootfs /
COPY run.sh /
RUN chmod a+x /run.sh

# Install required software
WORKDIR /app
RUN apk add nodejs npm
RUN npm install

# Execute startup script
CMD [ "/run.sh" ]