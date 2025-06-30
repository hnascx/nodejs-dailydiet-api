# Node.js Daily Diet API

### Application Rules

- It must be possible to create a user.  
- Users must be identifiable across requests.  
- It must be possible to log a meal with the following details:  
  *Meals should be associated with a user.*  
  - **Title**  
  - **Description**  
  - **Date and Time**  
  - **Whether it adheres to the diet or not**  

- It must be possible to edit a meal, with all the above data being modifiable.  
- It must be possible to delete a meal.  
- It must be possible to list all meals for a user.  
- It must be possible to view a single meal.  

- It must be possible to retrieve user metrics:  
  - **Total number of meals logged**  
  - **Total number of meals adhering to the diet**  
  - **Total number of meals not adhering to the diet**  
  - **Best streak of meals adhering to the diet**  

- Users can only view, edit, and delete meals they have created.  

### Technologies Used

The application was developed using:  
- **Fastify** as the framework  
- **Knex.js** as the query builder  
- **SQLite** as the database  
- **Vitest** for testing  
- **Zod** for validating the data sent in requests  

### Installation
`npm i`

### Running
`npm run dev`

### Testing
`npm run test`