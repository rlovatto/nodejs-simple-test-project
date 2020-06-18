const express = require('express');
const cors = require('cors');
const { uuid, isUuid } = require('uuidv4');

const app = express();
app.use(cors());
app.use(express.json());

const projects = [];

function logRequests (request, response, next){
    const {method, url} = request;

    const logLabel = `[${method.toUpperCase()} ${url}]`;
    
    console.time(logLabel);
    
    next(); //execute next middleware

    console.timeEnd(logLabel);
}

function validateProjectId (request, response, next){
    const { id } = request.params;

    if (!isUuid(id)){
        return response.status(400).json({error:"Invalid project ID."});
    }

    return next ();
}

app.use(logRequests); //it's necessary for the logRequests function be performed on each route 
app.use('/projects/:id', validateProjectId); //this line will execute the validateProjectId function on each route '/projects/:id'


// another way to execute the middleware is putting it as an argument in the routes. For example, if you want to execute it only on the get route, tou can comment the line app.use(logRequests) and use the code below. Other functions can be passed as argument as well (at the same time)
// app.get('/projects', logRequests, logRequests2, (request, response) =>{


app.get('/projects',(request, response) =>{
    const {title} = request.query;

    const results = title 
        ? projects.filter(project => project.title.includes(title))
        : projects;
    
    // return response.send('Hello World');
    return response.json(results);
});

app.post('/projects',(request, response) =>{
    const {title, owner} = request.body;

    const project = {id: uuid(), title, owner};

    projects.push(project);

    return response.json(project);
});

app.put('/projects/:id',(request, response) =>{
    const { id } = request.params;
    const { title, owner } = request.body;
    // const project = projects.find(project => project.id === id);
    const projectIndex = projects.findIndex(project => project.id === id);

    // if not found the return is -1
    if (projectIndex < 0){
        // the function status sends a code 400, otherwise it would return success
        return response.status(400).json({error: "Project not found!"});
    }

    const project = {
        id,
        title,
        owner
    };

    projects[projectIndex] = project;

    return response.json(project);
});

app.delete('/projects/:id',(request, response) =>{
    const { id } = request.params;
    const { title, owner } = request.body;
    // const project = projects.find(project => project.id === id);
    const projectIndex = projects.findIndex(project => project.id === id);

    if (projectIndex < 0){
        return response.status(400).json({error: "Project not found!"});
    }

    // splice removes from the array from the position in the first argument the ammount of positions in the second argument
    projects.splice(projectIndex,1);

    return response.status(204).send();
});

app.listen(3333,() => {
    console.log('Backend started!');
});