# Specify a base image
FROM node:alpine

#Install some dependencies

RUN apt-get update || : && apt-get install python -y


WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install

# Set up a default command
CMD [ "npm","start" ]