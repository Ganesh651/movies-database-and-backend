const express = require("express");
const path = require("path");

const {open} = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json())

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async ()=>{
      try{
            db = await open({
            filename: dbPath,
            driver: sqlite3.Database
            })
            app.listen(2000, ()=> {console.log("Server Running At http://localhost:2000")})
      }catch(e){
            console.log(`DB Error ${e.message}`)
            process.exit(1)
      }
}

initializeDBAndServer()


// get movies API 
app.get("/movies/", async (request,response)=>{
      const getMoviesQuery =  `SELECT movie_name FROM movie`
      const dbResponse = await db.all(getMoviesQuery)
      const updatedData = dbResponse.map(each=>({
            movieName: each.movie_name
      }))
      response.send(updatedData)
})

// Post or create movie API
app.post("/movies/", async (request,response)=>{
      const  movieDetails = request.body
      const {directorId,movieName,leadActor} = movieDetails
      const createMovieQuery = `INSERT 
      INTO movie 
      (director_id,movie_name,lead_actor)
       VALUES (${directorId},"${movieName}","${leadActor}");`;
      const dbResponse = await db.run(createMovieQuery)
      const lastId = dbResponse.lastID 
      response.send(`Movie has been added ${lastId}`)
})

// Post or create Director API
app.post("/director/", async (request,response)=>{
      const  directorDetails = request.body
      const {directorName} = directorDetails
      const createDirectorQuery = `INSERT 
      INTO director 
      (director_name)
       VALUES ("${directorName}");`;
      const dbResponse = await db.run(createDirectorQuery)
      const lastId = dbResponse.lastID 
      response.send(`Director has been added ${lastId}`)
});

// get movie API
app.get("/movies/:movieId/", async (request, response)=>{
      const {movieId} = request.params
      const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
      const dbResponse = await db.get(getMovieQuery)
      response.send({
            movieId: dbResponse.movie_id,
            directorId: dbResponse.director_id,
            movieName: dbResponse.movie_name,
            leadActor: dbResponse.lead_actor
      });
});

// update movie API 
app.put("/movies/:movieId/", async (request,response)=>{
      const {movieId} = request.params
      const updateMovieDetails = request.body
      const {directorId, movieName, leadActor} = updateMovieDetails

      updateMovieQuery = `
      UPDATE movie 
      SET director_id=${directorId}, movie_name="${movieName}", lead_actor="${leadActor}" 
      WHERE movie_id=${movieId};`;
      const dbResponse = await db.run(updateMovieQuery)
      response.send("Movie has been updated")
});


// Delete Movie API 
app.delete("/movies/:movieId/", async (request,response)=>{
      const {movieId} = request.params
      const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
      const dbResponse = await db.run(deleteMovieQuery)
      response.send("Movie Removed")
})


// Get Directors API
app.get("/directors/", async (request, response)=>{
      const getDirectorsQuery = `SELECT * FROM director`
      const dbResponse = await db.all(getDirectorsQuery)
      const updatedData = dbResponse.map(each=>({
            directorId: each.director_id,
            directorName: each.director_name
      }))

      response.send(updatedData)
})

// get director specific movies
app.get("/directors/:directorId/movies/", async (request, response)=>{
      const {directorId} = request.params

      const getDirectorSpecificMovies = `SELECT
       movie.movie_name AS movieName 
       FROM (movie INNER JOIN director ON movie.director_id = director.director_id) WHERE movie.director_id = ${directorId};`
      const dbResponse = await db.all(getDirectorSpecificMovies);
      response.send(dbResponse)
})