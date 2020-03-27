import { response } from "express";

fetch('localhost:9292/movies/populate').then(response=>{
    return response.json()
})
.then(users => {
    console.log(users)
})