# Specify a base image
FROM node:alpine

#Install some dependencies

RUN apk add update || : && apk add install python -y


WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install

# Set up a default command
CMD [ "npm","start" ]