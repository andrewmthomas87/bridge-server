import { json } from 'body-parser'
import * as express from 'express'
import { join } from 'path'

import Validation from './Validation'

const app = express()

interface ISuccessResponse<T> {
	ok: true
	data: T
}

interface IErrorResponse<T> {
	ok: false
	error: T
}

type IResponse<T> = ISuccessResponse<T> | IErrorResponse<T>

const EMPTY_SUCCESS_RESPONSE: ISuccessResponse<undefined> = successResponseFor(undefined)

function errorResponseFor<T>(error: T): IErrorResponse<T> {
	return {
		ok: false,
		error
	}
}

function successResponseFor<T>(data: T): ISuccessResponse<T> {
	return {
		ok: true,
		data
	}
}

interface ISignUpRequest {
	isGroup: boolean
	email: string
	password: string
	confirmPassword: string
}

interface ISignUpError {
	emailError: string
	passwordError: string
	confirmPasswordError: string
}

app.use(express.static(join(__dirname, '../../bridge-client/static/')))
app.use(json())

app.get('/*', (_, response) => {
	response.sendFile(join(__dirname, '../../bridge-client/home.html'))
})

app.get('/user/*', (_, response) => {
	response.sendFile(join(__dirname, '../../bridge-client/user.html'))
})

app.post('/sign-up', (request, response) => {
	const data: ISignUpRequest = request.body
	if (!isValid(data, 'isGroup', 'email', 'password', 'confirmPassword')) {
		response.sendStatus(400)
		return
	}

	const errors: Map<string, string> = new Map()
	let error: string = Validation.errorForEmail(data.email)
	if (error) errors.set('email', error)
	error = Validation.errorForPassword(data.password)
	if (error) errors.set('password', error)
	error = Validation.errorForConfirmPassword(data.password, data.confirmPassword)
	if (error) errors.set('confirmPassword', error)

	if (errors.size) {
		response.send(errorResponseFor<ISignUpError>({
			emailError: errors.get('email') || '',
			passwordError: errors.get('passwordError') || '',
			confirmPasswordError: errors.get('confirmPassword') || ''
		}))
	}
	else {
		response.send(EMPTY_SUCCESS_RESPONSE)
	}
})

app.listen(7777, () => {
	console.log('Server listening on port 7777')
})

function isValid(obj: Object, ...keys: string[]): boolean {
	for (let key of keys) {
		if (obj.hasOwnProperty(key)) {
			return false
		}
	}


	return true
}
