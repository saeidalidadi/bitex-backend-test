# Backend-developer test project

## Project description

We have a small project with [moleculer](https://moleculer.services/) framework. This project has some API for login, create user, forget password and reset password. You should open the project in the standard code editor like [vscode](https://code.visualstudio.com/) and search for "@todo", then implement all the expected code. 

To understand how to implement the code read the test cases and run it with the following instruction:

## How to run the project 

1.  build docker image

`docker build .`

2.  run on top of docker-compose

`docker-compose up -d`

3.  run docker container

`docker-compose run app sh`

4.  install dependencies

`npm i` 

5.  exit docker run

`exit`

3.  login docker container again

`docker-compose exec app sh`

5.  run test

`npm run jest`

**Your code must be pass all test cases.**

## Question

If you have any questions, please send an email to [nasservb@gmail.com](nasservb@gmail.com)

## Copyright
**This project is created for [http://bitex.ir](http://bitex.ir) and used to teset the backend developer. Do not publish this code on the internet.**
