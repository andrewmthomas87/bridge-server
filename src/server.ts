import * as express from 'express'

const app = express()

app.get('/', (_, response) => {
	response.write('Hello world')
	response.end()
})

app.listen(7777, () => {
	console.log('Server listening on port 7777')
})
