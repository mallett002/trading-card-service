# trading-card-service

![alt text](https://github.com/mallett002/trading-card-service/blob/main/trading-card-service.png?raw=true)

#### Description
This is a simple node api deployed to AWS Fargate

#### Running locally inside of docker
- Create a .env file with your `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` values so docker can read them
- Run `npm run docker:start` to build and start the app
- Run `npm run docker:stop` to stop the container and remove it
- Exec into container: `docker exec -it <container-hash> sh` (Can get the hash from running `docker ps`)
