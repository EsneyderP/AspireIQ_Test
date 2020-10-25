
## Requirements
- [Node.js](https://nodejs.org/) >= 6.x

<br />

## Scripts
**Install Modules**
```bash
$ npm i
$ npm i nodemon -g 
```
<br />

**Run**
```bash
$ npm run start # classic start OR
$ npm run dev # with nodemon live update  
```
Runs the application with [nodemon]("https://nodemon.io/"). Server is listening on Port 3000 by default. This can be overwritten by `PORT` constant in `.env` file. 


**Run Tests**
```bash
$ npm run test
```

<br />

## Future Improvements
- Adding JSON schema validation in order to avoid invalid mutations format.
- Adding full support for multiple nested array insertions in one single mutation.
- Create an API for routine external access.
- Saving the edited document on disk.
- Improve unit tests for the returned data structure.

## Support


## License
MIT

<br />
