import { json } from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'
import { join } from 'path'
import { hash, compare } from 'bcrypt'
import { sign, verify } from 'jsonwebtoken'

import connection, { IUserRow } from './connection'
import Validation from './Validation'
import API from './API'

const SALT_ROUNDS: number = 10
const JWT_SECRET: string = 'so very secret secret'
const COOKIE_NAME: string = 'bridge-user'

interface IToken {
	id: number
	isGroup: boolean
}

const app = express()

interface ISuccessResponse<T> {
	ok: true
	data: T
}

interface IErrorResponse<T> {
	ok: false
	error: T
}

// type IResponse<T, U> = ISuccessResponse<T> | IErrorResponse<U>

const EMPTY_SUCCESS_RESPONSE: ISuccessResponse<void> = successResponseFor(undefined)
const EMPTY_ERROR_RESPONSE: IErrorResponse<void> = errorResponseFor(undefined)

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

interface ISignInRequest {
	email: string,
	password: string
}

interface ISignUpRequest {
	isGroup: boolean
	name: string
	email: string
	password: string
	confirmPassword: string
}

interface ISignUpError {
	nameError: string
	emailError: string
	passwordError: string
	confirmPasswordError: string
}

app.use(express.static(join(__dirname, '../../bridge-client/static/')))
app.use(json())
app.use(cookieParser())

app.get('/sign-out', (_, response) => {
	response.clearCookie(COOKIE_NAME)
	response.redirect('/')
})

app.get('/user*', (request, response) => {
	const token: IToken | null = getToken(request)
	if (token === null) {
		response.redirect('/')
		return
	}

	response.sendFile(join(__dirname, `../../bridge-client/${token.isGroup ? 'group' : 'student'}.html`))
})

app.get('/*', (request, response) => {
	const token: IToken | null = getToken(request)
	if (token !== null) {
		response.redirect('/user')
		return
	}

	response.sendFile(join(__dirname, '../../bridge-client/home.html'))
})

app.post('/sign-in', (request, response) => {
	const data: ISignInRequest = request.body
	if (!isValid(data, 'email', 'password')) {
		response.sendStatus(400)
		return
	}

	let token: IToken
	connection.querySingleRow<IUserRow>('select id, isGroup, password from users where email=?', [data.email])
		.then((user: IUserRow) => {
			token = tokenFor(user.id, user.isGroup)
			return compare(data.password, user.password as string)
		})
		.then((result: boolean) => {
			if (!result) {
				throw false
			}

			response.cookie(COOKIE_NAME, sign(token, JWT_SECRET), {
				httpOnly: true,
				maxAge: 1000 * 60 * 60 * 24 * 7
			})
			response.send(EMPTY_SUCCESS_RESPONSE)
		})
		.catch(() => {
			response.send(EMPTY_ERROR_RESPONSE)
		})
})

app.post('/sign-up', (request, response) => {
	const data: ISignUpRequest = request.body
	if (!isValid(data, 'isGroup', 'name', 'email', 'password', 'confirmPassword')) {
		response.sendStatus(400)
		return
	}

	const errors: Map<string, string> = new Map()
	let error: string = Validation.errorForName(data.name)
	if (error) errors.set('name', error)
	error = Validation.errorForEmail(data.email)
	if (error) errors.set('email', error)
	error = Validation.errorForPassword(data.password)
	if (error) errors.set('password', error)
	error = Validation.errorForConfirmPassword(data.password, data.confirmPassword)
	if (error) errors.set('confirmPassword', error)

	if (errors.size) {
		response.send(errorResponseFor<ISignUpError>({
			nameError: errors.get('name') || '',
			emailError: errors.get('email') || '',
			passwordError: errors.get('password') || '',
			confirmPasswordError: errors.get('confirmPassword') || ''
		}))
		return
	}

	connection.querySingleRow('select id from users where email=?', [data.email])
		.then(() => {
			response.send(errorResponseFor<ISignUpError>({
				nameError: '',
				emailError: 'Email already in use',
				passwordError: '',
				confirmPasswordError: ''
			}))
		}).catch(() => {
			hash(data.password, SALT_ROUNDS)
				.then((hash: string) => {
					return connection.queryNoReturn('insert into users (isGroup, name, email, password) values (?, ?, ?, ?)', [data.isGroup, data.name, data.email, hash])
				}).then((id: number) => {
					response.cookie(COOKIE_NAME, sign(tokenFor(id, data.isGroup), JWT_SECRET), {
						httpOnly: true,
						maxAge: 1000 * 60 * 60 * 24 * 7
					})
					response.send(EMPTY_SUCCESS_RESPONSE)
				}).catch(() => {
					response.sendStatus(500)
				})
		})
})

const api = new API(app)
api.registerHandlers()

app.listen(7777, () => {
	console.log('Server listening on port 7777')
})

function tokenFor(id: number, isGroup: boolean): IToken {
	return { id, isGroup }
}

function getToken(request: express.Request): IToken | null {
	if (request.cookies && request.cookies[COOKIE_NAME]) {
		try {
			return verify(request.cookies[COOKIE_NAME], JWT_SECRET) as IToken
		} catch (e) {
			request.clearCookie(COOKIE_NAME)
		}
	}

	return null
}

function isValid(obj: Object, ...keys: string[]): boolean {
	for (let key of keys) {
		if (!obj.hasOwnProperty(key)) {
			return false
		}
	}


	return true
}

export { getToken, isValid, IToken }
