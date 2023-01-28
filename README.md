# trading-card-service

#### Description
This is a simple node api deployed to AWS Fargate

#### Running inside of docker
- Run `docker build . -t <username>/trading-card-service` to build the image
- Run `docker images` to see your newly built image
- Run `docker run -p 3000:3000 -d <username>/trading-card-service` to run the container from the built image
- Exec into container: `docker exec -it <container-hash> sh`
